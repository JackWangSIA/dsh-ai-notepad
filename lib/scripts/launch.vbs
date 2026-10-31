' AI Notepad external-open launcher.
'
' Windows cannot pass a file path through to the already-running DSH window:
' the desktop shell owns a single-instance lock but ignores argv. This launcher
' therefore writes the path into the plugin's inbox and then starts/focuses DSH.
' The Host plugin watches the inbox and the Client opens the received files.
Option Explicit

Dim shell, fso, args, target, homeDir, inbox, exePath, command, stream, queueName, i, code
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Set args = WScript.Arguments

If args.Count = 0 Then WScript.Quit 2

homeDir = shell.ExpandEnvironmentStrings("%DSH_HOME%")
If homeDir = "%DSH_HOME%" Or Len(homeDir) = 0 Then
  homeDir = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.dsh"
End If
Dim appDir
appDir = homeDir & "\ai-notepad"
inbox = appDir & "\inbox"

If Not fso.FolderExists(appDir) Then
  fso.CreateFolder appDir
End If
If Not fso.FolderExists(inbox) Then
  fso.CreateFolder inbox
End If

' Write one UTF-16LE queue file per invocation. Multiple selected files invoke
' this launcher repeatedly; each path is preserved independently.
Randomize
queueName = inbox & "\open-" & CStr(CLng(Timer * 1000)) & "-" & CStr(Int(Rnd * 1000000)) & ".txt"
Set stream = fso.CreateTextFile(queueName, True, True)
For i = 0 To args.Count - 1
  target = args(i)
  If Len(target) > 0 Then
    If i > 0 Then stream.WriteLine ""
    stream.Write target
  End If
Next
stream.Close

' Locate the packaged desktop executable from the existing dsh:// registration,
' then fall back to the default per-user installation path.
exePath = ""
On Error Resume Next
command = shell.RegRead("HKCU\Software\Classes\dsh\shell\open\command\")
On Error GoTo 0
If Len(command) > 1 Then
  code = InStr(command, """")
  If code > 0 Then
    Dim rest, endCode
    rest = Mid(command, code + 1)
    endCode = InStr(rest, """")
    If endCode > 0 Then exePath = Left(rest, endCode - 1)
  End If
End If
If Len(exePath) = 0 Or Not fso.FileExists(exePath) Then
  exePath = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\DeepSeek Harness\DeepSeek Harness.exe"
End If
If Not fso.FileExists(exePath) Then
  exePath = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\DeepSeek Harness\DeepSeek Harness.exe"
End If

If shell.ExpandEnvironmentStrings("%AINP_NO_LAUNCH%") <> "1" Then
  If fso.FileExists(exePath) Then
    ' Starting the packaged app focuses the existing instance through Electron's
    ' single-instance lock. If it is not running, this starts it normally.
    shell.Run """" & exePath & """", 1, False
  End If
End If
