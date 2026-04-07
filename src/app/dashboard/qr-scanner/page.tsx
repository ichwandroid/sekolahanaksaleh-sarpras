"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import pb from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CameraIcon, SearchIcon, SquareStopIcon } from "lucide-react"

type Barang = {
  id: string
  kode_barang: string
  no_bukti?: string
  nama_barang: string
  tanggal_perolehan: string
  harga: number
  lokasi: string
  kondisi: "baik" | "rusak ringan" | "rusak berat"
  sumber_dana: string
  tahun_anggaran: string
  penanggung_jawab: string
  merk: string
  spesifikasi: string
  keterangan: string
}

type DetectedBarcode = {
  rawValue?: string
}

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<DetectedBarcode[]>
}

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[]
}) => BarcodeDetectorInstance

type WindowWithBarcodeDetector = Window & {
  BarcodeDetector?: BarcodeDetectorConstructor
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount ?? 0)

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return dateString
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

const getNoBukti = (barang: Barang) => {
  if (barang.no_bukti) return barang.no_bukti
  const match = barang.keterangan?.match(/No Bukti:\s*(.+)$/i)
  return match?.[1]?.trim() || "-"
}

const escapeFilterValue = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')

const normalizeScannedValue = (rawValue: string) => {
  const trimmedValue = rawValue.trim()

  try {
    const url = new URL(trimmedValue)
    const kodeFromQuery = url.searchParams.get("kode")
    if (kodeFromQuery) {
      return kodeFromQuery
    }
  } catch {
    return trimmedValue
  }

  return trimmedValue
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="min-w-[140px] text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? "-"}</span>
    </div>
  )
}

export default function QrScannerPage() {
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null)
  const hasAutoLoadedRef = useRef(false)

  const [kodeBarang, setKodeBarang] = useState("")
  const [scannerStatus, setScannerStatus] = useState(
    "Masukkan kode barang atau aktifkan kamera untuk scan QR inventaris."
  )
  const [cameraSupported, setCameraSupported] = useState(false)
  const [barcodeSupported, setBarcodeSupported] = useState(false)
  const [secureContextReady, setSecureContextReady] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [barang, setBarang] = useState<Barang | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const windowWithBarcodeDetector = window as WindowWithBarcodeDetector
    const canUseCamera =
      typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia

    setCameraSupported(canUseCamera)
    setBarcodeSupported(!!windowWithBarcodeDetector.BarcodeDetector)
    setSecureContextReady(window.isSecureContext)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    const kodeFromQuery = searchParams.get("kode")
    if (!kodeFromQuery || hasAutoLoadedRef.current) return

    hasAutoLoadedRef.current = true
    setKodeBarang(kodeFromQuery)
    void lookupBarang(kodeFromQuery)
  }, [searchParams])

  const stopScanner = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setScannerActive(false)
    setScannerStatus("Scanner dihentikan. Anda bisa scan lagi atau cari manual.")
  }

  const lookupBarang = async (inputValue: string) => {
    const normalizedCode = normalizeScannedValue(inputValue)

    if (!normalizedCode) {
      setBarang(null)
      setError("Kode barang belum diisi.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const record = await pb.collection("barang").getFirstListItem<Barang>(
        `kode_barang="${escapeFilterValue(normalizedCode)}"`,
        { $autoCancel: false }
      )

      setKodeBarang(normalizedCode)
      setBarang(record)
      setScannerStatus(`Data inventaris ditemukan untuk kode ${normalizedCode}.`)
    } catch (lookupError: unknown) {
      console.error(lookupError)
      setBarang(null)
      setError(`Data inventaris dengan kode ${normalizedCode} tidak ditemukan.`)
      setScannerStatus("QR berhasil dibaca, tetapi data inventarisnya tidak ditemukan.")
    } finally {
      setLoading(false)
    }
  }

  const startScanner = async () => {
    const windowWithBarcodeDetector = window as WindowWithBarcodeDetector

    if (!window.isSecureContext) {
      setScannerStatus(
        "Di HP, kamera browser hanya aktif di HTTPS atau localhost. Akses aplikasi lewat HTTPS agar kamera bisa digunakan."
      )
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerStatus("Browser ini tidak mendukung akses kamera. Gunakan input manual.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: false,
      })

      streamRef.current = stream

      if (!videoRef.current) return

      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setScannerActive(true)

      if (!windowWithBarcodeDetector.BarcodeDetector) {
        setScannerStatus(
          "Kamera sudah aktif, tetapi browser ini belum mendukung pembacaan QR otomatis. Gunakan Chrome/Edge Android atau cari manual dengan kode barang."
        )
        return
      }

      detectorRef.current = new windowWithBarcodeDetector.BarcodeDetector({
        formats: ["qr_code"],
      })

      setScannerStatus("Arahkan kamera ke QR inventaris untuk membaca kode barang.")

      const scanFrame = async () => {
        if (!videoRef.current || !detectorRef.current) return

        try {
          const detectedBarcodes = await detectorRef.current.detect(videoRef.current)
          const detectedValue = detectedBarcodes.find((item) => item.rawValue)?.rawValue

          if (detectedValue) {
            stopScanner()
            void lookupBarang(detectedValue)
            return
          }
        } catch (scanError) {
          console.error(scanError)
          setScannerStatus("Kamera aktif, tetapi QR belum terbaca. Coba arahkan ulang.")
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          void scanFrame()
        })
      }

      void scanFrame()
    } catch (cameraError) {
      console.error(cameraError)
      setScannerActive(false)
      setScannerStatus("Akses kamera ditolak atau tidak tersedia. Gunakan input manual.")
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await lookupBarang(kodeBarang)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Scanner Inventaris</h1>
          <p className="mt-1 text-muted-foreground">
            Scan QR pada label inventaris untuk membuka detail barang secara cepat.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Scanner</CardTitle>
              <CardDescription>
                Gunakan kamera perangkat atau masukkan kode barang secara manual.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-xl border bg-muted/30">
                <video
                  ref={videoRef}
                  className="aspect-video w-full bg-black object-cover"
                  muted
                  playsInline
                />
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                {scannerStatus}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void startScanner()}
                  disabled={scannerActive || !cameraSupported || !secureContextReady}
                >
                  <CameraIcon />
                  Aktifkan Kamera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopScanner}
                  disabled={!scannerActive}
                >
                  <SquareStopIcon />
                  Hentikan Scanner
                </Button>
              </div>

              {(!cameraSupported || !secureContextReady || !barcodeSupported) && (
                <p className="text-xs text-muted-foreground">
                  {!secureContextReady
                    ? "Kamera mobile biasanya tidak bisa dipakai di URL HTTP biasa. Buka aplikasi lewat HTTPS atau localhost."
                    : !cameraSupported
                      ? "Browser ini tidak mendukung akses kamera."
                      : "Browser ini bisa membuka kamera, tetapi belum tentu mendukung pembacaan QR otomatis. Anda tetap bisa mencari inventaris lewat input manual."}
                </p>
              )}

              <Separator />

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="kode-barang" className="text-sm font-medium">
                    Kode Barang
                  </label>
                  <Input
                    id="kode-barang"
                    value={kodeBarang}
                    onChange={(event) => setKodeBarang(event.target.value)}
                    placeholder="Contoh: 26-MJG-BKT001/2026-001"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  <SearchIcon />
                  {loading ? "Mencari..." : "Cari Inventaris"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Inventaris</CardTitle>
              <CardDescription>
                Hasil scan QR akan menampilkan data inventaris yang tersimpan di sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : barang ? (
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-4 pb-2">
                    <div>
                      <h2 className="text-lg font-semibold">{barang.nama_barang}</h2>
                      <p className="text-sm text-muted-foreground">{barang.kode_barang}</p>
                    </div>
                    <Badge
                      variant={
                        barang.kondisi === "baik"
                          ? "default"
                          : barang.kondisi === "rusak ringan"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {barang.kondisi.toUpperCase()}
                    </Badge>
                  </div>

                  <Separator />
                  <DetailRow label="No. Bukti" value={getNoBukti(barang)} />
                  <DetailRow label="Merk / Brand" value={barang.merk} />
                  <DetailRow label="Spesifikasi" value={barang.spesifikasi} />
                  <DetailRow label="Lokasi" value={barang.lokasi} />
                  <DetailRow label="Harga" value={formatRupiah(barang.harga)} />
                  <DetailRow label="Sumber Dana" value={barang.sumber_dana} />
                  <DetailRow label="Tahun Anggaran" value={formatDate(barang.tahun_anggaran)} />
                  <DetailRow label="Tanggal Perolehan" value={formatDate(barang.tanggal_perolehan)} />
                  <DetailRow label="Penanggung Jawab" value={barang.penanggung_jawab} />

                  {barang.keterangan && (
                    <>
                      <Separator className="my-2" />
                      <div>
                        <p className="text-sm font-medium">Keterangan</p>
                        <p className="mt-1 text-sm text-muted-foreground">{barang.keterangan}</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Belum ada data yang ditampilkan. Scan QR inventaris atau cari dengan kode barang
                  untuk membuka detail.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
