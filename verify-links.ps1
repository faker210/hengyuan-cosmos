# Batch verify all zh pages on dev server: HTTP 200 + Chinese not garbled
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http
[System.Net.ServicePointManager]::DefaultConnectionLimit = 64
$base = "http://localhost:5173/hengyuan-cosmos/zh/"
$docs = "C:\Users\Administrator\Doubao\chats\2026-09-14\new-chat\site\docs\zh"
$files = Get-ChildItem $docs -Filter *.md | Sort-Object Name

$kw1 = [string]::Join('', @([char]0x8861, [char]0x5143, [char]0x5b99))   # 衡元宙
$kw2 = [string]::Join('', @([char]0x951a, [char]0x70b9))                  # 锚点
$kw3 = [string]::Join('', @([char]0x5171, [char]0x751f))                  # 共生

$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.MaxConnectionsPerServer = 32
$client = [System.Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(30)

$semaphore = [System.Threading.SemaphoreSlim]::new(24)
$failList = [System.Collections.Concurrent.ConcurrentBag[string]]::new()
$garbledList = [System.Collections.Concurrent.ConcurrentBag[string]]::new()
$okCount = 0

$jobs = @()
foreach ($f in $files) {
    $jobs += [pscustomobject]@{ Name = $f.Name; Url = $base + [Uri]::EscapeDataString($f.BaseName) }
}

$tasks = foreach ($j in $jobs) {
    $null = $semaphore.WaitAsync()
    [System.Threading.Tasks.Task]::Run([Action]{
        try {
            $resp = $client.GetAsync($j.Url).GetAwaiter().GetResult()
            if ($resp.IsSuccessStatusCode) {
                $content = $resp.Content.ReadAsStringAsync().GetAwaiter().GetResult()
                $hasCn = $content.Contains($kw1) -or $content.Contains($kw2) -or $content.Contains($kw3)
                if (-not $hasCn) {
                    $garbledList.Add($j.Name + " [no-cn-keyword]")
                } else {
                    $script:okCount++
                }
            } else {
                $failList.Add($j.Name + " [" + [int]$resp.StatusCode + "]")
            }
        } catch {
            $failList.Add($j.Name + " [ERR]")
        } finally {
            $null = $semaphore.Release()
        }
    })
}

$all = [System.Threading.Tasks.Task]::WhenAll($tasks)
$all.Wait()

Write-Output ("=== DONE: total={0} ok={1} fail={2} garbled={3} ===" -f $jobs.Count, $okCount, $failList.Count, $garbledList.Count)
Write-Output "=== FAIL LIST ==="
$failList | Sort-Object | Select-Object -First 40 | ForEach-Object { Write-Output $_ }
Write-Output "=== GARBLED LIST ==="
$garbledList | Sort-Object | Select-Object -First 20 | ForEach-Object { Write-Output $_ }
