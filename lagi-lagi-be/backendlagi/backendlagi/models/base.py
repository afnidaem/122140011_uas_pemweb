# models/base.py
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# Database configuration
DATABASE_URL = "postgresql://postgres:cOOlyeah22@localhost:5432/databaseweb"
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db_session():
    return SessionLocal()

def create_tables():
    Base.metadata.create_all(bind=engine)