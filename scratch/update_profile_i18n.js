const fs = require('fs');

const updateI18n = (langPath, data) => {
    let i18n = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    if (!i18n.profilePage) i18n.profilePage = {};
    i18n.profilePage = { ...i18n.profilePage, ...data };
    fs.writeFileSync(langPath, JSON.stringify(i18n, null, 2));
};

const enData = {
    "accountManagement": "Account Management",
    "accountManagementDesc": "Manage your account settings and preferences",
    "editProfileInfo": "Edit Profile Info",
    "purchaseHistory": "Transaction History",
    "profileInfoTitle": "Profile Information",
    "profilePicture": "Profile Picture",
    "profilePictureHint": "JPG, PNG or GIF. Max 2MB.",
    "fullNameLabel": "Full Name",
    "emailLabel": "Email",
    "emailCannotChange": "Email cannot be changed",
    "phoneLabel": "Phone Number",
    "dobLabel": "Date of Birth",
    "bioLabel": "Bio",
    "bioHint": "Write a short bio about yourself (max 1000 characters)",
    "savingBtn": "Saving...",
    "saveBtn": "Save Changes",
    "languageSettings": "Language Settings",
    "changePassword": "Change Password",
    "notificationOptions": "Notification Options",
    "logoutTitle": "Log Out",
    "logoutDesc": "Log out from this device.",
    "logoutBtn": "Log Out",
    "dangerAction": "Irreversible Action",
    "deleteAccountTitle": "Delete Account",
    "deleteAccountDesc": "When you delete your account, it cannot be recovered. Please consider carefully.",
    "deleteAccountBtn": "Delete Account",
    "noPurchaseHistory": "No transaction history yet",
    "savingSuccess": "Updated successfully.",
    "savingError": "Failed to update profile.",
    "confirmDelete": "Are you sure you want to delete your account? This action cannot be undone.",
    "deleteNotImplemented": "Account deletion feature is under development."
};

updateI18n('E:/speak/DOANCOSO/doancoso/frontend/src/locales/en/translation.json', enData);
console.log('I18n updated successfully.');
