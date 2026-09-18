from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Manager that makes email the primary identifier (no username)."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model.  Email is the login field; username is unused.
    """

    username = None  # remove the inherited username field
    email = models.EmailField(unique=True, help_text="Used as the login identifier.")
    name = models.CharField(max_length=255, blank=True, help_text="Display name.")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # email is already required via USERNAME_FIELD

    objects = UserManager()

    def __str__(self):
        return self.email
