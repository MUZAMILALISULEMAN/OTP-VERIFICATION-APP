import yagmail
import random 
import os

def generateOTP():
    otp = ''
    for i in range(6):
        otp+=str(chr(49+random.randint(0,8)))
    return otp


sender_email = os.getenv("EMAIL") 
app_password = os.getenv("EMAIL-KEY") 
from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String, Boolean, DateTime,Select,Update
from sqlalchemy.orm import declarative_base,sessionmaker,Session
from datetime import datetime, timedelta
from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
Base = declarative_base()
class OTPRequest(Base):
    __tablename__ = "otp_requests"

    id = Column(Integer, primary_key=True,autoincrement=True)
    email = Column(String(255), nullable=False)
    otp_code = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean,default=True)

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

engine = create_engine("postgresql+psycopg2://postgres.lkuvnupemcccfkvrtthw:hello123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres")
session = sessionmaker(autoflush=False,autocommit=False,bind=engine)
Base.metadata.create_all(bind=engine)


app = FastAPI()

class EmailRequest(BaseModel):
    email:str
class OTPInfo(BaseModel):
    email:str
    otp_code:str
def getDB():
    
    sessionLocal =session()
    try:
        yield sessionLocal
    finally:
        sessionLocal.close()




app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://muzamilalisuleman.github.io"],              # 🔐 only allow these origins
    allow_credentials=True,
    allow_methods=["*"],                # GET, POST, etc.
    allow_headers=["*"],                # Accept, Content-Type, Authorization, etc.
)

@app.post("/submit")
def submit(data:EmailRequest,db:Session = Depends(getDB)):

    
    stmt =Update(OTPRequest).where(OTPRequest.email == data.email).values(is_active = False)
    db.execute(stmt)
    db.commit()
    otpCode = generateOTP()
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    payload = OTPRequest(email=data.email,otp_code=otpCode,expires_at=expires_at)
    db.add(payload)
    db.commit()




    postman = yagmail.SMTP(user=sender_email,password=app_password)
    postman.send(
            to=data.email,
            subject="SecureAuth OTP Verification",
            contents=f"Your OTP is {otpCode}"
        )
    return {"status":"success"}



@app.post("/verify")
def verify(data:OTPInfo,db:Session = Depends(getDB)):
    
    stmt =Select(OTPRequest).order_by(OTPRequest.created_at.desc()).where(OTPRequest.email == data.email,OTPRequest.otp_code == data.otp_code)
    entry = db.execute(stmt).first()
    if entry is None:
        return {"status":"not found"}
    if not entry[0].is_expired() and entry[0].is_active:
        return {"status":"success"}
    else:
        if entry[0].is_active:
            entry[0].is_active = False
        return {"status":"error"}
        




