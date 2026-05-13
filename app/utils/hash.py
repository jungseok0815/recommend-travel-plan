import bcrypt

def hash_password(password: str) -> str:
    encoded = password.encode('utf-8')[:72]
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    encoded = plain.encode('utf-8')[:72]
    return bcrypt.checkpw(encoded, hashed.encode('utf-8'))
