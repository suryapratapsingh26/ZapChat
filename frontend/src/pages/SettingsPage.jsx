const SettingsPage = () => {
  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-base-content/70">
            Manage your account settings.
          </p>
        </div>

        {/* You can add other non-theme related settings here in the future */}
      </div>
    </div>
  );
};

export default SettingsPage;
