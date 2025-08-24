# Load Testing Script
import time
import threading
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

class LoadTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.results = {
            "create_agent": [],
            "get_agents": [],
            "chat_message": []
        }
    
    def time_function(self, func, *args, **kwargs):
        """Time a function execution"""
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        return result, end_time - start_time
    
    def create_agent(self, name_suffix):
        """Create an agent"""
        agent_data = {
            "name": f"LoadTestAgent_{name_suffix}",
            "description": f"Agent for load testing #{name_suffix}",
            "model": "lm_studio",
            "capabilities": ["research"]
        }
        
        response, duration = self.time_function(
            client.post, "/api/agents", json=agent_data
        )
        
        if response.status_code == 200:
            self.results["create_agent"].append(duration)
            return response.json()["id"]
        else:
            print(f"Failed to create agent: {response.status_code}")
            return None
    
    def get_agents(self):
        """Get list of agents"""
        response, duration = self.time_function(client.get, "/api/agents")
        
        if response.status_code == 200:
            self.results["get_agents"].append(duration)
            return len(response.json())
        else:
            print(f"Failed to get agents: {response.status_code}")
            return 0
    
    def send_chat_message(self, agent_id, message_suffix):
        """Send a chat message"""
        message_data = {
            "message": f"Load test message #{message_suffix}",
            "agent_id": agent_id
        }
        
        response, duration = self.time_function(
            client.post, "/api/chat", json=message_data
        )
        
        if response.status_code == 200:
            self.results["chat_message"].append(duration)
            return True
        else:
            print(f"Failed to send message: {response.status_code}")
            return False
    
    def run_single_user_test(self, operations=10):
        """Test performance with a single user"""
        print("Running single user test...")
        
        # Create an agent first
        agent_id = self.create_agent("single")
        if not agent_id:
            return
        
        # Perform operations
        for i in range(operations):
            self.get_agents()
            self.send_chat_message(agent_id, i)
            time.sleep(0.1)  # Small delay between operations
        
        print("Single user test completed")
    
    def run_concurrent_users_test(self, users=10, operations_per_user=5):
        """Test performance with concurrent users"""
        print(f"Running concurrent test with {users} users...")
        
        # Create agents for each user first
        agent_ids = []
        for i in range(users):
            agent_id = self.create_agent(f"concurrent_{i}")
            if agent_id:
                agent_ids.append(agent_id)
        
        if not agent_ids:
            print("Failed to create agents for concurrent test")
            return
        
        def user_workflow(user_id, agent_id):
            """Workflow for a single user"""
            user_results = []
            
            for i in range(operations_per_user):
                # Get agents list
                _, get_duration = self.time_function(client.get, "/api/agents")
                user_results.append(("get_agents", get_duration))
                
                # Send chat message
                message_data = {
                    "message": f"Message from user {user_id}, operation {i}",
                    "agent_id": agent_id
                }
                _, chat_duration = self.time_function(
                    client.post, "/api/chat", json=message_data
                )
                user_results.append(("chat_message", chat_duration))
                
                time.sleep(0.05)  # Small delay
            
            return user_results
        
        # Run concurrent users
        with ThreadPoolExecutor(max_workers=users) as executor:
            futures = [
                executor.submit(user_workflow, i, agent_ids[i % len(agent_ids)])
                for i in range(users)
            ]
            
            for future in as_completed(futures):
                user_results = future.result()
                for operation, duration in user_results:
                    self.results[operation].append(duration)
        
        print("Concurrent users test completed")
    
    def run_stress_test(self, max_users=50, increment=10):
        """Gradually increase load to find breaking point"""
        print("Running stress test...")
        
        for users in range(increment, max_users + 1, increment):
            print(f"Testing with {users} users...")
            
            start_time = time.time()
            self.run_concurrent_users_test(users=users, operations_per_user=3)
            end_time = time.time()
            
            total_time = end_time - start_time
            print(f"Completed {users} users in {total_time:.2f} seconds")
            
            # Check if system is struggling
            avg_response_time = statistics.mean(self.results["get_agents"][-users*3:])
            if avg_response_time > 2.0:  # More than 2 seconds average
                print(f"System struggling at {users} users (avg response: {avg_response_time:.2f}s)")
                break
            
            time.sleep(1)  # Brief rest between tests
        
        print("Stress test completed")
    
    def print_results(self):
        """Print performance results"""
        print("\n" + "="*50)
        print("PERFORMANCE TEST RESULTS")
        print("="*50)
        
        for operation, durations in self.results.items():
            if durations:
                avg = statistics.mean(durations)
                median = statistics.median(durations)
                min_time = min(durations)
                max_time = max(durations)
                count = len(durations)
                
                print(f"\n{operation.upper()}:")
                print(f"  Count:     {count}")
                print(f"  Average:   {avg:.3f}s")
                print(f"  Median:    {median:.3f}s")
                print(f"  Min:       {min_time:.3f}s")
                print(f"  Max:       {max_time:.3f}s")
            else:
                print(f"\n{operation.upper()}: No data")
        
        print("="*50)

def main():
    """Main function to run load tests"""
    tester = LoadTester()
    
    try:
        # Run tests
        tester.run_single_user_test(operations=20)
        time.sleep(1)
        
        tester.run_concurrent_users_test(users=20, operations_per_user=5)
        time.sleep(2)
        
        tester.run_stress_test(max_users=50, increment=10)
        
        # Print results
        tester.print_results()
        
    except Exception as e:
        print(f"Load test failed: {e}")
        tester.print_results()

if __name__ == "__main__":
    main()