# SkyMap local server — mở http://localhost:5500/weather-map/
$port = 5500
# Thư mục gốc repo (cha của weather-map)
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "  SkyMap dang chay!" -ForegroundColor Cyan
Write-Host "  Mo link nay tren trinh duyet:" -ForegroundColor Green
Write-Host "  http://localhost:$port/weather-map/" -ForegroundColor Yellow
Write-Host "  Trang tong hop: http://localhost:$port/" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Nhan Ctrl+C de dung server." -ForegroundColor DarkGray
Write-Host ""

Start-Process "http://localhost:$port/weather-map/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $rel = [Uri]::UnescapeDataString($req.Url.LocalPath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }

    $path = Join-Path $root ($rel -replace "/", [IO.Path]::DirectorySeparatorChar)

    if ((Test-Path $path -PathType Container)) {
      $path = Join-Path $path "index.html"
    }

    if (-not (Test-Path $path -PathType Leaf)) {
      $res.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.Close()
      continue
    }

    $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
    $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
    $bytes = [IO.File]::ReadAllBytes($path)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.Close()
  }
}
finally {
  $listener.Stop()
}
