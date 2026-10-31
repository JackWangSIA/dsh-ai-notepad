$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.Drawing | Out-Null
$collection = New-Object System.Drawing.Text.InstalledFontCollection
$names = @($collection.Families | ForEach-Object { $_.Name } | Sort-Object -Unique)
@{ fonts = $names } | ConvertTo-Json -Compress
