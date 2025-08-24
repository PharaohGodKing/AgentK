# Stress Testing Script
import time
import random
import threading
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

class StressTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.success_count = 0
        self.failure_count = 0
        self.lock = threading.Lock()
    
    def create_agent(self):
        """Create an agent"""
        agent_data = {
            "name": f"StressTestAgent_{random.randint(1000, 9999)}",
            "description": "Agent for stress testing",
            "model": "lm_studio",
            "capabilities": ["research"]
        }
        
        try:
            response = client.post("/api/agents", json=agent_data, timeout=10)
            if response.status_code == 200:
                with self.lock:
                    self.success_count += 1
                return response.json()["id"]
            else:
                with self.lock:
                    self.failure_count += 1
                return None
        except Exception as e:
            with self.lock:
                self.failure_count += 1
            return None
    
    def get_agents(self):
        """Get list of agents"""
        try:
            response = client.get("/api/agents", timeout=10)
            if response.status_code == 200:
                with self.lock:
                    self.success_count += 1
                return True
            else:
                with self.lock:
                    self.failure_count += 1
                return False
        except Exception as e:
            with self.lock:
                self.failure_count += 1
            return False
    
    def send_chat_message(self, agent_id):
        """Send a chat message"""
        message_data = {
            "message": f"Stress test message {random.randint(1, 1000)}",
            "agent_id": agent_id
        }
        
        try:
            response = client.post("/api/chat", json=message_data, timeout=10)
            if response.status_code == 200:
                with self.lock:
                    self.success_count += 1
                return True
            else:
                with self.lock:
                    self.failure_count += 1
                return False
        except Exception as e:
            with self.lock:
                self.failure_count += 1
            return False
    
    def run_operation(self, operation_type, agent_id=None):
        """Run a single operation"""
        if operation_type == "create_agent":
            return self.create_agent()
        elif operation_type == "get_agents":
            return self.get_agents()
        elif operation_type == "chat" and agent_id:
            return self.send_chat_message(agent_id)
        return False
    
    def run_constant_load(self, operations_per_second=10, duration=60):
        """Run constant load for specified duration"""
        print(f"Running constant load of {operations_per_second} ops/sec for {duration} seconds...")
        
        # Create some agents first for chat operations
        agent_ids = []
        for _ in range(5):
            agent_id = self.create_agent()
            if agent_id:
                agent_ids.append(agent_id)
        
        if not agent_ids:
            print("Failed to create initial agents")
            return
        
        end_time = time.time() + duration
        operation_count = 0
        
        while time.time() < end_time:
            start_batch = time.time()
            batch_count = 0
            
            # Run a batch of operations
            with ThreadPoolExecutor(max_workers=operations_per_second) as executor:
                futures = []
                
                for _ in range(operations_per_second):
                    # Choose random operation type
                    op_type = random.choice(["get_agents", "chat", "get_agents", "chat", "get_agents"])
                    
                    if op_type == "chat":
                        agent_id = random.choice(agent_ids)
                        futures.append(executor.submit(self.run_operation, op_type, agent_id))
                    else:
                        futures.append(executor.submit(self.run_operation, op_type))
                
                # Wait for batch to complete
                for future in futures:
                    future.result()
                    batch_count += 1
            
            operation_count += batch_count
            
            # Adjust timing to maintain rate
            batch_time = time.time() - start_batch
            if batch_time < 1.0:
                time.sleep(1.0 - batch_time)
        
        print(f"Completed {operation_count} operations in {duration} seconds")
        print(f"Success rate: {self.success_count}/{self.success_count + self.failure_count} "
              f"({self.success_count/(self.success_count + self.failure_count)*100:.1f}%)")
    
    def run_spike_test(self, base_rate=5, spike_rate=100, spike_duration=10, total_duration=120):
        """Run spike test with periodic load spikes"""
        print(f"Running spike test: {base_rate} ops/sec base, {spike_rate} ops/sec spikes...")
        
        # Create agents first
        agent_ids = []
        for _ in range(5):
            agent_id = self.create_agent()
            if agent_id:
                agent_ids.append(agent_id)
        
        end_time = time.time() + total_duration
        spike_interval = 30  # seconds between spikes
        next_spike = time.time() + spike_interval
        
        while time.time() < end_time:
            current_time = time.time()
            
            if current_time >= next_spike:
                # Spike period
                rate = spike_rate
                spike_end = current_time + spike_duration
                print(f"SPIKE: Running at {rate} ops/sec for {spike_duration} seconds")
                
                while time.time() < spike_end and time.time() < end_time:
                    self.run_batch(rate, agent_ids)
                    time.sleep(1.0)
                
                next_spike = time.time() + spike_interval
            else:
                # Base period
                rate = base_rate
                self.run_batch(rate, agent_ids)
                time.sleep(1.0)
        
        print("Spike test completed")
        print(f"Success rate: {self.success_count}/{self.success_count + self.failure_count} "
              f"({self.success_count/(self.success_count + self.failure_count)*100:.1f}%)")
    
    def run_batch(self, rate, agent_ids):
        """Run a batch of operations at specified rate"""
        with ThreadPoolExecutor(max_workers=rate) as executor:
            futures = []
            
            for _ in range(rate):
                op_type = random.choice(["get_agents", "chat", "get_agents", "chat", "get_agents"])
                
                if op_type == "chat" and agent_ids:
                    agent_id = random.choice(agent_ids)
                    futures.append(executor.submit(self.run_operation, op_type, agent_id))
                else:
                    futures.append(executor.submit(self.run_operation, op_type))
            
            # Wait for batch to complete
            for future in futures:
                future.result()
    
    def run_endurance_test(self, rate=5, duration=3600):
        """Run endurance test for extended period"""
        print(f"Running endurance test at {rate} ops/sec for {duration} seconds...")
        
        # Create agents first
        agent_ids = []
        for _ in range(5):
            agent_id = self.create_agent()
            if agent_id:
                agent_ids.append(agent_id)
        
        end_time = time.time() + duration
        interval_start = time.time()
        operations_in_interval = 0
        
        while time.time() < end_time:
            self.run_batch(rate, agent_ids)
            operations_in_interval += rate
            
            # Check interval (every minute)
            if time.time() - interval_start >= 60:
                print(f"Interval: {operations_in_interval} operations, "
                      f"Success rate: {self.success_count/(self.success_count + self.failure_count)*100:.1f}%")
                interval_start = time.time()
                operations_in_interval = 0
            
            time.sleep(1.0)
        
        print("Endurance test completed")
        print(f"Total success rate: {self.success_count}/{self.success_count + self.failure_count} "
              f"({self.success_count/(self.success_count + self.failure_count)*100:.1f}%)")

def main():
    """Main function to run stress tests"""
    tester = StressTester()
    
    try:
        print("Starting stress tests...")
        
        # Run different stress scenarios
        print("\n1. Constant Load Test")
        tester.run_constant_load(operations_per_second=20, duration=120)
        
        print("\n2. Spike Test")
        tester.run_spike_test(base_rate=5, spike_rate=50, spike_duration=15, total_duration=180)
        
        print("\n3. Endurance Test")
        # Uncomment for longer test
        # tester.run_endurance_test(rate=10, duration=3600)  # 1 hour test
        
        print("\nAll stress tests completed!")
        
    except KeyboardInterrupt:
        print("\nStress test interrupted by user")
    except Exception as e:
        print(f"Stress test failed: {e}")

if __name__ == "__main__":
    main()