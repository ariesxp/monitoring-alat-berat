<?php

namespace App\Traits;

trait HasDocumentNumber
{
    public static function generateNumber(string $prefix): string
    {
        $year = date('Y');
        $month = date('m');
        $column = static::$numberColumn ?? 'nomor';

        $lastRecord = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderByDesc('id')
            ->first();

        $sequence = 1;
        if ($lastRecord) {
            $lastNumber = $lastRecord->{$column};
            $parts = explode('-', $lastNumber);
            $sequence = ((int) end($parts)) + 1;
        }

        return sprintf('%s-%s%s-%04d', $prefix, $year, $month, $sequence);
    }
}
