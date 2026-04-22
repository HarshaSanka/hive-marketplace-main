from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json
import os

# #region agent log - Debug config loading
_debug_log_path = os.environ.get("DEBUG_LOG_PATH", "/app/.cursor/debug.log")
try:
    os.makedirs(os.path.dirname(_debug_log_path), exist_ok=True)
    with open(_debug_log_path, "a") as _f:
        _f.write(json.dumps({"location": "config.py:9", "message": "Config module loading v3", "data": {"version": "v3_model_config"}}) + "\n")
except:
    pass
# #endregion


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        env_ignore_empty=True,  # Ignore empty env vars - key fix!
        extra="ignore"
    )
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/marketplace.db"
    
    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-here-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    REMEMBER_ME_EXPIRE_DAYS: int = 30
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 5242880  # 5MB
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@hive.com"
    
    # CORS - stored as string to avoid pydantic-settings JSON parsing issues
    CORS_ORIGINS: str = "http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS into a list. Supports JSON array or comma-separated string."""
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "":
            return ["http://localhost:3000"]
        # Try parsing as JSON array first
        try:
            parsed = json.loads(self.CORS_ORIGINS)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
        # Fall back to comma-separated string
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


# #region agent log - Settings instantiation
try:
    settings = Settings()
    try:
        with open(_debug_log_path, "a") as _f:
            _f.write(json.dumps({"location": "config.py:65", "message": "Settings SUCCESS", "data": {"cors": settings.CORS_ORIGINS}}) + "\n")
    except:
        pass
except Exception as _e:
    try:
        with open(_debug_log_path, "a") as _f:
            _f.write(json.dumps({"location": "config.py:70", "message": "Settings FAILED", "data": {"error": str(_e)}}) + "\n")
    except:
        pass
    raise
# #endregion
