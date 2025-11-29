from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cloud-Native Insurance System"
    AWS_REGION: str = "us-east-1"
    # These names must match your Terraform Outputs!
    DYNAMODB_TABLE: str = "insurance-claim-system-claims-dev" 
    S3_BUCKET: str = "intl-euro-capstone-team2" # Update this with your actual bucket name
    JWT_SECRET_NAME: str = "jwt_secret"
    JWT_ALGORITHM: str = "HS256"

    class Config:
        case_sensitive = True

settings = Settings()
