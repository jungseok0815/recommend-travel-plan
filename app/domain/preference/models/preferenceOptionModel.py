from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class PreferenceCategory(Base):
    __tablename__ = "PREFERENCE_CATEGORIES"

    id           = Column(Integer, primary_key=True, index=True)
    key          = Column(String(50), unique=True, nullable=False)
    title        = Column(String(200), nullable=False)
    subtitle     = Column(String(200), nullable=False)
    multi_select = Column(Boolean, default=False, nullable=False)
    sort_order   = Column(Integer, nullable=False)

    options = relationship(
        "PreferenceOption",
        back_populates="category",
        order_by="PreferenceOption.sort_order",
    )


class PreferenceOption(Base):
    __tablename__ = "PREFERENCE_OPTIONS"

    id          = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("PREFERENCE_CATEGORIES.id"), nullable=False)
    value       = Column(String(50), nullable=False)
    label       = Column(String(50), nullable=False)
    icon        = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    sort_order  = Column(Integer, nullable=False)
    is_active   = Column(Boolean, default=True, nullable=False)

    category = relationship("PreferenceCategory", back_populates="options")
