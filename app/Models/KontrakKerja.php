<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class KontrakKerja extends Model
{
    use SoftDeletes;

    protected $table = 'kontrak_kerja';

    private const NOMOR_PREFIX = 'AOB';
    private const NOMOR_SETTING_KEY = 'kontrak_kerja_last_nomor';

    protected $fillable = [
        'nomor_kontrak',
        'client_id',
        'nama_proyek',
        'lokasi_proyek',
        'deskripsi',
        'tanggal_mulai',
        'tanggal_selesai',
        'nilai_kontrak',
        'status',
        'approved_by',
        'approved_at',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'approved_at' => 'datetime',
            'nilai_kontrak' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function kontrakAlat(): HasMany
    {
        return $this->hasMany(KontrakAlat::class);
    }

    public function spk(): HasMany
    {
        return $this->hasMany(Spk::class);
    }

    public function biayaOperasional(): HasMany
    {
        return $this->hasMany(BiayaOperasional::class);
    }

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Hitung nomor kontrak berikutnya tanpa menyimpan (untuk ditampilkan di form).
     * Format: AOB-yyyymm-0001
     */
    public static function previewNomorKontrak(): string
    {
        $periode = date('Ym');
        $sequence = static::sequenceFromLast(Setting::get(self::NOMOR_SETTING_KEY), $periode);

        return static::composeNomor($periode, $sequence);
    }

    /**
     * Buat & simpan nomor kontrak berikutnya. Nomor urut terakhir disimpan di
     * tabel settings dan direset otomatis setiap awal bulan.
     */
    public static function generateNomorKontrak(): string
    {
        return DB::transaction(function () {
            $periode = date('Ym');
            $setting = Setting::where('key', self::NOMOR_SETTING_KEY)->lockForUpdate()->first();

            $sequence = static::sequenceFromLast($setting?->value, $periode);
            $nomor = static::composeNomor($periode, $sequence);

            Setting::updateOrCreate(
                ['key' => self::NOMOR_SETTING_KEY],
                ['value' => $nomor]
            );

            return $nomor;
        });
    }

    private static function composeNomor(string $periode, int $sequence): string
    {
        return sprintf('%s-%s-%04d', self::NOMOR_PREFIX, $periode, $sequence);
    }

    private static function sequenceFromLast(?string $last, string $periode): int
    {
        if (!$last) {
            return 1;
        }

        $parts = explode('-', $last);

        // Reset ke 1 bila bulan berganti, lanjut increment bila masih bulan yang sama.
        if (count($parts) === 3 && $parts[1] === $periode) {
            return ((int) $parts[2]) + 1;
        }

        return 1;
    }
}
