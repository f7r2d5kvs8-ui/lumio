$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$index = [IO.File]::ReadAllText((Join-Path $root 'index.template.html'))
$css = [IO.File]::ReadAllText((Join-Path $root 'styles.css'))
$css += "`r`n" + [IO.File]::ReadAllText((Join-Path $root 'games.css'))
$css += "`r`n" + [IO.File]::ReadAllText((Join-Path $root 'letters.css'))
$css += "`r`n" + [IO.File]::ReadAllText((Join-Path $root 'trace-fix.css'))
$css += "`r`n" + [IO.File]::ReadAllText((Join-Path $root 'mascot.css'))
$languages = [IO.File]::ReadAllText((Join-Path $root 'data\languages.js')) -replace 'export const ', 'const '
$audioFa = [IO.File]::ReadAllText((Join-Path $root 'data\audio-fa.js')) -replace 'export const ', 'const '
$writingPaths = [IO.File]::ReadAllText((Join-Path $root 'data\writing-paths.js')) -replace 'export const ', 'const '
$storage = [IO.File]::ReadAllText((Join-Path $root 'modules\storage.js')) -replace 'export function ', 'function '
$inputValidation = [IO.File]::ReadAllText((Join-Path $root 'modules\input-validation.js')) -replace 'export function ', 'function '
$cloud = [IO.File]::ReadAllText((Join-Path $root 'modules\cloud.js')) -replace '(?m)^import[^\r\n]*\r?\n', "const createClient = window.supabase?.createClient;`r`n" -replace 'export const ', 'const ' -replace 'export async function ', 'async function '
$app = [IO.File]::ReadAllText((Join-Path $root 'app.js')) -replace '(?m)^import[^\r\n]*\r?\n', ''
$script = $languages + "`r`n" + $audioFa + "`r`n" + $writingPaths + "`r`n" + $storage + "`r`n" + $inputValidation + "`r`n" + $cloud + "`r`n" + $app
$mascotFiles = @('lumio-welcome.webp', 'lumio-learning.webp', 'lumio-celebration.webp')
foreach ($file in $mascotFiles) {
  $path = Join-Path $root "assets\mascot\$file"
  $dataUri = 'data:image/webp;base64,' + [Convert]::ToBase64String([IO.File]::ReadAllBytes($path))
  $script = $script.Replace("./assets/mascot/$file", $dataUri)
}
$audioFiles = Get-ChildItem (Join-Path $root 'assets\audio\fa') -Filter '*.wav'
foreach ($file in $audioFiles) {
  $dataUri = 'data:audio/wav;base64,' + [Convert]::ToBase64String([IO.File]::ReadAllBytes($file.FullName))
  $script = $script.Replace("./assets/audio/fa/$($file.Name)", $dataUri)
}
$index = $index -replace '<link rel="stylesheet" href="styles.css">', "<style>`r`n$css`r`n</style>"
$index = $index -replace '\s*<link rel="stylesheet" href="games.css">', ''
$index = $index -replace '\s*<link rel="stylesheet" href="letters.css">', ''
$index = $index -replace '\s*<link rel="stylesheet" href="trace-fix.css">', ''
$index = $index -replace '\s*<link rel="stylesheet" href="mascot.css">', ''
$index = $index -replace '<script type="module" src="app.js"></script>', "<script>`r`n$script`r`n</script>"
[IO.File]::WriteAllText((Join-Path $root 'index.html'), $index, (New-Object Text.UTF8Encoding($false)))
Write-Output 'Standalone Lumio build generated.'
