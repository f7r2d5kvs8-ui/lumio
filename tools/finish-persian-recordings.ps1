$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
powershell -ExecutionPolicy Bypass -File (Join-Path $projectRoot 'build-standalone.ps1')
Start-Process (Join-Path $projectRoot 'index.html')
Write-Output 'Lumio rebuilt with the new Persian recordings.'
