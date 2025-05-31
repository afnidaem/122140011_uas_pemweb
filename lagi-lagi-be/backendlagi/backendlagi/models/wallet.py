# models/wallet.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .base import Base

class WalletType(enum.Enum):
    cash = "cash"
    bank = "bank"
    credit_card = "credit_card"
    e_wallet = "e_wallet"

class Wallet(Base):
    __tablename__ = 'wallets'
    
    id = Column(Integer, primary_key=True)
    nama_dompet = Column(String(100), nullable=False)
    deskripsi = Column(String(255))
    saldo_awal = Column(Float, default=0.0)
    saldo_saat_ini = Column(Float, default=0.0)
    tipe_dompet = Column(Enum(WalletType), nullable=False)
    warna = Column(String(7))  # Hex color code
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")
    
    def __init__(self, nama_dompet, deskripsi, saldo_awal, tipe_dompet, warna):
        self.nama_dompet = nama_dompet
        self.deskripsi = deskripsi
        self.saldo_awal = saldo_awal
        self.saldo_saat_ini = saldo_awal
        self.tipe_dompet = tipe_dompet
        self.warna = warna
    
    def to_dict(self):
        return {
            'id': self.id,
            'nama_dompet': self.nama_dompet,
            'deskripsi': self.deskripsi,
            'saldo_awal': self.saldo_awal,
            'saldo_saat_ini': self.saldo_saat_ini,
            'tipe_dompet': self.tipe_dompet.value if self.tipe_dompet else None,
            'warna': self.warna,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }