from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Trip(Base):
    __tablename__ = "Trips"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("Users.id"), nullable=False)
    destination      = Column(String(100), nullable=False)
    transport        = Column(String(50), nullable=False)
    start_datetime   = Column(String(50), nullable=False)
    end_datetime     = Column(String(50), nullable=False)
    group_size       = Column(Integer, nullable=False)
    budget           = Column(Integer, nullable=False)
    total_cost       = Column(Integer, nullable=True)
    remaining_budget = Column(Integer, nullable=True)
    status           = Column(String(20), nullable=False, default='계획 중')

    days   = relationship("TripDay", back_populates="trip")
    review = relationship("TripReview", back_populates="trip", uselist=False)


class TripDay(Base):
    __tablename__ = "TripDays"
    id       = Column(Integer, primary_key=True, index=True)
    trip_id  = Column(Integer, ForeignKey("Trips.id"), nullable=False)
    date     = Column(String(20), nullable=False)
    day      = Column(Integer, nullable=False)
    day_cost = Column(Integer, nullable=False)

    trip      = relationship("Trip", back_populates="days")
    schedules = relationship("TripSchedule", back_populates="day")


class TripSchedule(Base):
    __tablename__ = "TripSchedules"
    id               = Column(Integer, primary_key=True, index=True)
    trip_day_id      = Column(Integer, ForeignKey("TripDays.id"), nullable=False)
    time             = Column(String(10), nullable=False)
    activity         = Column(String(100), nullable=False)
    location         = Column(String(100), nullable=False)
    transport        = Column(String(50), nullable=True)
    duration         = Column(String(20), nullable=True)
    cost             = Column(Integer, nullable=False, default=0)
    remaining_budget = Column(Integer, nullable=True)
    note             = Column(String(255), nullable=True)

    day = relationship("TripDay", back_populates="schedules")


class TripReview(Base):
    __tablename__ = "TripReviews"
    id         = Column(Integer, primary_key=True, index=True)
    trip_id    = Column(Integer, ForeignKey("Trips.id"), nullable=False, unique=True)
    user_id    = Column(Integer, ForeignKey("Users.id"), nullable=False)
    rating     = Column(Integer, nullable=False)
    content    = Column(String(1000), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    trip = relationship("Trip", back_populates="review")
