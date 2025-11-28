from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cloud-Native Insurance System"
    AWS_REGION: str = "us-east-1"
    # These names must match your Terraform Outputs!
    DYNAMODB_TABLE: str = "insurance-claim-system-claims-dev" 
    S3_BUCKET: str = "insurance-claim-system-docs-dev-12345" # Update this with your actual bucket name

    class Config:
        case_sensitive = True

settings = Settings()
