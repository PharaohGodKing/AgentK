from typing import List, Optional, Dict, Any
from backend.models.workflow import Workflow, WorkflowCreate, WorkflowUpdate, WorkflowStatus
from backend.db.database import get_db
from backend.db.crud import create_workflow, get_workflow, get_all_workflows, update_workflow, delete_workflow
import uuid

class WorkflowService:
    def __init__(self):
        self.db = get_db()
    
    async def get_all_workflows(self) -> List[Workflow]:
        """Get all workflows"""
        return await get_all_workflows(self.db)
    
    async def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        """Get a specific workflow by ID"""
        return await get_workflow(self.db, workflow_id)
    
    async def create_workflow(self, workflow_data: WorkflowCreate) -> Workflow:
        """Create a new workflow"""
        workflow_id = str(uuid.uuid4())
        workflow = Workflow(
            id=workflow_id,
            **workflow_data.dict(),
            status=WorkflowStatus.DRAFT
        )
        return await create_workflow(self.db, workflow)
    
    async def update_workflow(self, workflow_id: str, workflow_data: WorkflowUpdate) -> Optional[Workflow]:
        """Update an existing workflow"""
        return await update_workflow(self.db, workflow_id, workflow_data)
    
    async def delete_workflow(self, workflow_id: str) -> bool:
        """Delete a workflow"""
        return await delete_workflow(self.db, workflow_id)
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a workflow with input data"""
        workflow = await self.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow with ID {workflow_id} not found")
        
        # This is a simplified workflow execution
        # In a real implementation, you would:
        # 1. Parse the workflow nodes and connections
        # 2. Execute each node in the correct order
        # 3. Handle conditional logic and loops
        # 4. Return the final result
        
        result = {
            "workflow_id": workflow_id,
            "status": "completed",
            "input": input_data,
            "output": {"message": f"Workflow '{workflow.name}' executed successfully"},
            "steps": []
        }
        
        # Simulate workflow execution steps
        for node in workflow.nodes:
            result["steps"].append({
                "node_id": node.id,
                "node_type": node.type,
                "status": "completed",
                "result": f"Processed {node.type} node"
            })
        
        return result
    
    async def validate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Validate a workflow structure"""
        workflow = await self.get_workflow(workflow_id)
        if not workflow:
            return {"valid": False, "errors": ["Workflow not found"]}
        
        errors = []
        
        # Check for empty workflow
        if not workflow.nodes:
            errors.append("Workflow has no nodes")
        
        # Check for disconnected nodes
        connected_nodes = set()
        for node in workflow.nodes:
            for connection in node.connections:
                connected_nodes.add(connection)
        
        all_node_ids = {node.id for node in workflow.nodes}
        disconnected_nodes = all_node_ids - connected_nodes - {"start", "end"}  # Allow start/end to be disconnected
        
        if disconnected_nodes:
            errors.append(f"Disconnected nodes: {', '.join(disconnected_nodes)}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "node_count": len(workflow.nodes),
            "connection_count": sum(len(node.connections) for node in workflow.nodes)
        }