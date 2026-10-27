from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


# Register your models here.
class CustomUserAdmin(UserAdmin):
    list_display = ('first_name', 'last_name', 'username', 'email', 'role')
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Information", {
            "fields": ("role",),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)