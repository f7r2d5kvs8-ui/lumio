$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$python = 'C:\Users\Digibank\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$port = 8765
$url = "http://127.0.0.1:$port/tools/persian-audio-recorder.html"
Start-Process -FilePath $python -ArgumentList @('-m','http.server',$port,'--bind','127.0.0.1','--directory',$projectRoot) -WindowStyle Hidden
Start-Sleep -Milliseconds 900
Start-Process $url
Write-Output "Lumio Persian recorder opened at $url"
