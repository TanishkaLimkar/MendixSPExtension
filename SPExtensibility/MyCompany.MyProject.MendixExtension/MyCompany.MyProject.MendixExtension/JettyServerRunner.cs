using System;
using System.Diagnostics;
using System.Linq;
using System.Management;
using System.Net;
using System.Net.NetworkInformation;
using System.Threading;
using Eto.Forms;

public static class JettyServerRunner
{
    private static Process _jettyProcess;

    public static void StartJettyServer()
    {
        Thread jettyThread = new Thread(() =>
        {
            try
            {
                string jarPath = @"C:\Users\tanis\IdeaProjects\untitled\build\libs\jetty-servlet-example-1.0-SNAPSHOT.jar";

                ProcessStartInfo processInfo = new ProcessStartInfo("java", $"-jar \"{jarPath}\"")
                {
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                _jettyProcess = Process.Start(processInfo);
                if (_jettyProcess != null)
                {
                    _jettyProcess.OutputDataReceived += (sender, args) => Console.WriteLine(args.Data);
                    _jettyProcess.ErrorDataReceived += (sender, args) => Console.WriteLine(args.Data);

                    _jettyProcess.BeginOutputReadLine();
                    _jettyProcess.BeginErrorReadLine();

                    _jettyProcess.WaitForExit();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to start Jetty server: {ex.Message}");
            }
        })
        {
            IsBackground = true
        };

        jettyThread.Start();
    }

    public static void StopJettyServer()
    {
        MessageBox.Show("Process initiated to stop the server !");
        int port = 8081;

        try
        {
            int pid = GetProcessIdUsingPort(port);
            if (pid != -1)
            {
                Console.WriteLine($"Stopping Jetty server (PID: {pid})...");
                Process.Start(new ProcessStartInfo
                {
                    FileName = "taskkill",
                    Arguments = $"/PID {pid} /F",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }).WaitForExit();

                Console.WriteLine("Jetty server stopped successfully.");
                MessageBox.Show("Jetty Server Stopped Successfully!");
            }
            else
            {
                Console.WriteLine("No process found listening on port 8081.");
                MessageBox.Show("No process found listening on port 8081.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to stop Jetty server: {ex.Message}");
            MessageBox.Show("Failed to stop Jetty Server !");
        }
    }

    private static int GetProcessIdUsingPort(int port)
    {
        try
        {
            var processStartInfo = new ProcessStartInfo
            {
                FileName = "netstat",
                Arguments = "-a -n -o",
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = Process.Start(processStartInfo))
            {
                if (process == null)
                {
                    return -1;
                }

                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                var lines = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    if (line.Contains($":{port}"))
                    {
                        var parts = line.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length > 4 && int.TryParse(parts[4], out var pid))
                        {
                            return pid;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to get process ID using port {port}: {ex.Message}");
        }

        return -1;
    }
}
