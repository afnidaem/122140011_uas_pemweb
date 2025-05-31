from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
from .base import Base

class TransactionType(enum.Enum):
    income = "income"
    expense = "expense"

class Category(Base):
    __tablename__ = 'category'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)

    # Relationship
    transactions = relationship("Transaction", back_populates="category")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "transaction_type": self.transaction_type.value if self.transaction_type else None
        }