# Benchmarking Script
import time
import statistics
import json
from datetime import datetime
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

class Benchmark:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": {}
        }
    
    def measure_endpoint(self, endpoint, method="GET", data=None, name=None, iterations=10):
        """Measure performance of an API endpoint"""
        if name is None:
            name = endpoint
        
        print(f"Benchmarking {name} ({iterations} iterations)...")
        
        times = []
        successes = 0
        
        for i in range(iterations):
            try:
                start_time = time.time()
                
                if method == "GET":
                    response = client.get(endpoint)
                elif method == "POST":
                    response = client.post(endpoint, json=data)
                elif method == "PUT":
                    response = client.put(endpoint, json=data)
                elif method == "DELETE":
                    response = client.delete(endpoint)
                else:
                    raise ValueError(f"Unsupported method: {method}")
                
                end_time = time.time()
                
                if 200 <= response.status_code < 300:
                    times.append(end_time - start_time)
                    successes += 1
                else:
                    print(f"Request failed with status {response.status_code}")
                    
            except Exception as e:
                print(f"Request failed with exception: {e}")
            
            # Small delay between requests
            if i < iterations - 1:
                time.sleep(0.1)
        
        if times:
            stats = {
                "iterations": iterations,
                "successes": successes,
                "success_rate": successes / iterations,
                "min_time": min(times),
                "max_time": max(times),
                "avg_time": statistics.mean(times),
                "median_time": statistics.median(times),
                "p95_time": statistics.quantiles(times, n=100)[94] if len(times) > 1 else times[0],
                "times": times
            }
            
            self.results["tests"][name] = stats
            print(f"  Success rate: {stats['success_rate']:.1%}")
            print(f"  Average time: {stats['avg_time']:.3f}s")
            print(f"  P95 time:     {stats['p95_time']:.3f}s")
        else:
            print("  No successful requests")
        
        return times
    
    def run_agent_benchmarks(self, iterations=10):
        """Run benchmarks for agent endpoints"""
        print("\n" + "="*50)
        print("AGENT ENDPOINT BENCHMARKS")
        print("="*50)
        
        # Create an agent first for other tests
        agent_data = {
            "name": "BenchmarkAgent",
            "description": "Agent for benchmarking",
            "model": "lm_studio",
            "capabilities": ["research"]
        }
        
        create_response = client.post("/api/agents", json=agent_data)
        if create_response.status_code != 200:
            print("Failed to create agent for benchmarking")
            return None
        
        agent_id = create_response.json()["id"]
        
        # Benchmark endpoints
        self.measure_endpoint("/api/agents", "GET", name="List Agents", iterations=iterations)
        self.measure_endpoint(f"/api/agents/{agent_id}", "GET", name="Get Agent", iterations=iterations)
        
        update_data = {"description": "Updated description"}
        self.measure_endpoint(
            f"/api/agents/{agent_id}", "PUT", update_data, 
            name="Update Agent", iterations=iterations
        )
        
        return agent_id
    
    def run_workflow_benchmarks(self, iterations=5):
        """Run benchmarks for workflow endpoints"""
        print("\n" + "="*50)
        print("WORKFLOW ENDPOINT BENCHMARKS")
        print("="*50)
        
        # Create a workflow first
        workflow_data = {
            "name": "BenchmarkWorkflow",
            "description": "Workflow for benchmarking",
            "steps": [
                {
                    "agent": "test_agent",
                    "action": "test_action",
                    "inputs": ["input_data"],
                    "outputs": ["output_data"]
                }
            ]
        }
        
        create_response = client.post("/api/workflows", json=workflow_data)
        if create_response.status_code != 200:
            print("Failed to create workflow for benchmarking")
            return None
        
        workflow_id = create_response.json()["id"]
        
        # Benchmark endpoints
        self.measure_endpoint("/api/workflows", "GET", name="List Workflows", iterations=iterations)
        self.measure_endpoint(f"/api/workflows/{workflow_id}", "GET", name="Get Workflow", iterations=iterations)
        
        return workflow_id
    
    def run_chat_benchmarks(self, agent_id, iterations=10):
        """Run benchmarks for chat endpoints"""
        print("\n" + "="*50)
        print("CHAT ENDPOINT BENCHMARKS")
        print("="*50)
        
        if not agent_id:
            print("No agent ID provided for chat benchmarks")
            return
        
        # Benchmark chat message
        message_data = {
            "message": "Benchmark test message",
            "agent_id": agent_id
        }
        
        self.measure_endpoint(
            "/api/chat", "POST", message_data, 
            name="Send Message", iterations=iterations
        )
        
        # Benchmark chat history
        self.measure_endpoint(
            "/api/chat/history", "GET", 
            name="Get Chat History", iterations=iterations
        )
    
    def run_comprehensive_benchmark(self, iterations=10):
        """Run comprehensive benchmark of all endpoints"""
        print("COMPREHENSIVE PERFORMANCE BENCHMARK")
        print(f"Started at: {self.results['timestamp']}")
        print(f"Iterations per test: {iterations}")
        print("="*60)
        
        # Run all benchmarks
        agent_id = self.run_agent_benchmarks(iterations)
        workflow_id = self.run_workflow_benchmarks(iterations)
        self.run_chat_benchmarks(agent_id, iterations)
        
        # Clean up
        if agent_id:
            client.delete(f"/api/agents/{agent_id}")
        if workflow_id:
            client.delete(f"/api/workflows/{workflow_id}")
        
        print("\n" + "="*60)
        print("BENCHMARK COMPLETED")
        print("="*60)
    
    def save_results(self, filename=None):
        """Save benchmark results to file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"benchmark_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"Results saved to {filename}")
        return filename
    
    def print_summary(self):
        """Print summary of benchmark results"""
        print("\n" + "="*60)
        print("BENCHMARK SUMMARY")
        print("="*60)
        
        for test_name, stats in self.results["tests"].items():
            print(f"\n{test_name}:")
            print(f"  Success:    {stats['success_rate']:.1%} ({stats['successes']}/{stats['iterations']})")
            print(f"  Avg Time:   {stats['avg_time']:.3f}s")
            print(f"  Median:     {stats['median_time']:.3f}s")
            print(f"  P95:        {stats['p95_time']:.3f}s")
            print(f"  Range:      {stats['min_time']:.3f}s - {stats['max_time']:.3f}s")

def main():
    """Main function to run benchmarks"""
    benchmark = Benchmark()
    
    try:
        # Run comprehensive benchmark
        benchmark.run_comprehensive_benchmark(iterations=15)
        
        # Print summary and save results
        benchmark.print_summary()
        benchmark.save_results()
        
    except Exception as e:
        print(f"Benchmark failed: {e}")
        benchmark.save_results("benchmark_error.json")

if __name__ == "__main__":
    main()