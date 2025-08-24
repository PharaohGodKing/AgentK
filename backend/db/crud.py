from typing import List
from sqlalchemy.sql import select
from backend.db.database import agents_table, engine
from backend.models.agent import Agent

async def get_all_agents() -> List[Agent]:
    """
    Retrieves all agents from the database.
    """
    query = select(agents_table)
    with engine.connect() as connection:
        result = connection.execute(query)
        rows = result.fetchall()
        # Map database rows to Pydantic models
        return [Agent(id=row[0], name=row[1], role=row[2], status=row[3]) for row in rows]

async def check_if_agents_exist() -> bool:
    """
    Checks if there are any agents in the database.
    """
    query = select(agents_table).limit(1)
    with engine.connect() as connection:
        return connection.execute(query).first() is not None

async def seed_initial_agents():
    """
    Inserts the initial set of agents into the database if it's empty.
    """
    if not await check_if_agents_exist():
        initial_agents = [
            {"id": "researcher-01", "name": "Research Assistant", "role": "Web research and analysis", "status": "online"},
            {"id": "coder-01", "name": "Coding Assistant", "role": "Code generation and review", "status": "busy"},
            {"id": "writer-01", "name": "Writing Assistant", "role": "Content creation and editing", "status": "online"},
        ]
        query = agents_table.insert()
        with engine.connect() as connection:
            connection.execute(query, initial_agents)
            connection.commit()