$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.Windows.Forms | Out-Null
$dialog = New-Object System.Windows.Forms.SaveFileDialog
$dialog.Title = 'Save file from AI Notepad'
$dialog.Filter = 'Text files|*.txt;*.md;*.json;*.yaml;*.log;*.csv|All files|*.*'
$dialog.OverwritePrompt = $true
$dialog.AddExtension = $true
$dialog.RestoreDirectory = $true
if ($env:AINP_SUGGESTED) {
  $name = [System.IO.Path]::GetFileName($env:AINP_SUGGESTED)
  if ($name) { $dialog.FileName = $name }
}
$result = $dialog.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
  @{ canceled = $false; paths = @($dialog.FileName) } | ConvertTo-Json -Compress
} else {
  @{ canceled = $true; paths = @() } | ConvertTo-Json -Compress
}
