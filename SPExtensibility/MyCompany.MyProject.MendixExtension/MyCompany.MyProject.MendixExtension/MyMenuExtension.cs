using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using Eto.Forms;
using Mendix.StudioPro.ExtensionsAPI.UI.Menu;
using Mendix.StudioPro.ExtensionsAPI.UI.Services;

namespace MyCompany.MyProject.MendixExtension
{
    [Export(typeof(MenuBarExtension))]
    class MyMenuExtension : MenuBarExtension
    {
        readonly IUserAuthenticationService authService;
        private readonly IDockingWindowService dockingWindowService;

        [ImportingConstructor]
        public MyMenuExtension(IUserAuthenticationService authService, IDockingWindowService dockingWindowService)
        {
            this.authService = authService;
            this.dockingWindowService = dockingWindowService;
        }

        public override IEnumerable<MenuViewModelBase> GetMenus()
        {
            yield return new MenuItemViewModel("My extension", placeUnder: new[] { "app" }, placeAfter: "tools")
            {
                Action = () => MessageBox.Show(authService.TryRetrieveUserName(out var userName) ? $"Hello {userName}!" : "Hello anonymous!")
            };

            yield return new MenuItemViewModel("Database Connection", placeUnder: new[] { "app" }, placeAfter: "tools")
            {
                Action = () => dockingWindowService.OpenPane(MyDockablePaneExtension.ID)
            };

            yield return new MenuItemViewModel("Start Jetty Server", placeUnder: new[] { "app" }, placeAfter: "tools")
            {
                Action = () => StartJettyServer()
            };
            yield return new MenuItemViewModel("Stop Jetty Server", placeUnder: new[] { "app" }, placeAfter: "tools")
            {
                Action = () => JettyServerRunner.StopJettyServer()
            };


        }
       /* private void StopJettyServer()
        {
            try
            {
                JettyServerRunner.StopJettyServer();
                MessageBox.Show("Jetty Server Stopped!");
            }
            catch(Exception ex)
            {
                MessageBox.Show($"Failed to stop Jetty Server : {ex.Message}");
            }
        }*/

        private void StartJettyServer()
        {
            try
            {
                JettyServerRunner.StartJettyServer();
                MessageBox.Show("Jetty Server Started Successfully!");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to start Jetty Server: {ex.Message}");
            }
        }
    }
}



