from typing import List, Optional
from uuid import UUID
from backend.db.crud import CRUDBase
from backend.models.agent import Agent, AgentCreate, AgentUpdate, AgentStatus
from backend.models.sql_models import AgentModel
from sqlalchemy.ext.asyncio import AsyncSession

class AgentService:
    def __init__(self):
        self.crud = CRUDBase[AgentModel, AgentCreate, AgentUpdate](AgentModel)

    async def get_agents(
        self, skip: int = 0, limit: int = 100, db: AsyncSession = None
    ) -> List[Agent]:
        db_agents = await self.crud.get_multi(db, skip=skip, limit=limit)
        return [self._convert_to_pydantic(agent) for agent in db_agents]

    async def get_agent(self, agent_id: UUID, db: AsyncSession = None) -> Optional[Agent]:
        db_agent = await self.crud.get(db, agent_id)
        if db_agent:
            return self._convert_to_pydantic(db_agent)

    async def create_agent(self, agent_data: AgentCreate, db: AsyncSession = None) -> Agent:
        db_agent = await self.crud.create(db, obj_in=agent_data)
        return self._convert_to_pydantic(db_agent)

    async def update_agent(
        self, agent_id: UUID, agent_data: AgentUpdate, db: AsyncSession = None
    ) -> Optional[Agent]:
        db_agent = await self.crud.get(db, agent_id)
        if not db_agent:
            return None
        
        updated_agent = await self.crud.update(db, db_obj=db_agent, obj_in=agent_data)
        return self._convert_to_pydantic(updated_agent)

    async def delete_agent(self, agent_id: UUID, db: AsyncSession = None) -> bool:
        return await self.crud.delete(db, id=agent_id)

    async def get_agents_count(self, db: AsyncSession = None) -> int:
        # This would be implemented with actual count query
        return 0

    def _convert_to_pydantic(self, db_agent: AgentModel) -> Agent:
        return Agent(
            id=db_agent.id,
            name=db_agent.name,
            description=db_agent.description,
            avatar=db_agent.avatar,
            model=db_agent.model,
            capabilities=db_agent.capabilities,
            status=AgentStatus(db_agent.status),
            created_at=db_agent.created_at,
            updated_at=db_agent.updated_at
        )