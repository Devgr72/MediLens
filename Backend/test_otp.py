import asyncio
from app.config.database import connect_to_mongo, get_database, close_mongo_connection

async def get_otp():
    await connect_to_mongo()
    db = get_database()
    otp_record = await db["otp_codes"].find_one({"email": "rahul.sharma@gmail.com"})
    print("OTP is:", otp_record["otp"])
    await close_mongo_connection()

asyncio.run(get_otp())
