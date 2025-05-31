# models/transaction.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .category import Category, TransactionType  # Import TransactionType dari category.py
import enum
from .base import Base

class TransactionType(enum.Enum):
    income = "income"
    expense = "expense"

class expenseCategory(enum.Enum):
    makanan_dan_minuman = 1
    transport = 2
    belanja = 3
    hiburan = 4
    tagihan_dan_utilitas = 5
    kesehatan = 6
    pendidikan = 7
    rumah = 8
    perjalanan = 9
    hadiah_dan_donasi = 10
    lainnya = 11

class incomeCategory(enum.Enum):
    gaji = 12
    bisnis = 13
    investasi = 14
    bonus = 15
    hadiah = 16
    piutang = 17
    lainnya = 18

class Transaction(Base):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True)
    tipe_transaksi = Column(Enum(TransactionType), nullable=False)
    jumlah = Column(Float, nullable=False)
    deskripsi = Column(String(255))
    wallet_id = Column(Integer, ForeignKey('wallets.id'), nullable=False)
    tanggal = Column(DateTime, nullable=False)
    catatan = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    # Kategori sekarang berupa foreign key ke tabel category
    category_id = Column(Integer, ForeignKey('category.id'), nullable=False)
    category = relationship("Category", back_populates="transactions")
    wallet_id = Column(Integer, ForeignKey('wallets.id'), nullable=False)

    wallet = relationship("Wallet", back_populates="transactions")
    
    def to_dict(self):
        return {
            'id': self.id,
            'tipe_transaksi': self.tipe_transaksi.value if self.tipe_transaksi else None,
            'jumlah': self.jumlah,
            'deskripsi': self.deskripsi,
            'wallet_id': self.wallet_id,
            'tanggal': self.tanggal.isoformat() if self.tanggal else None,
            'catatan': self.catatan,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }