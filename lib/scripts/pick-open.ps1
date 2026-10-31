$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.Windows.Forms | Out-Null
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = 'Open file in AI Notepad'
$dialog.Filter = 'Text files|*.txt;*.md;*.markdown;*.json;*.yaml;*.yml;*.log;*.csv;*.ini;*.cfg;*.xml;*.html;*.css;*.js;*.ts;*.py;*.ps1;*.bat|All files|*.*'
$dialog.Multiselect = $true
$dialog.CheckFileExists = $true
$dialog.RestoreDirectory = $true
$result = $dialog.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
  @{ canceled = $false; paths = @($dialog.FileNames) } | ConvertTo-Json -Compress
} else {
  @{ canceled = $true; paths = @() } | ConvertTo-Json -Compress
}
