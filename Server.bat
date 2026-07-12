@echo off
:: Arahkan ke direktori proyek Laravel Anda
cd \"monitoring-alat-berat"

:: Jalankan npm run dev di jendela CMD terpisah
start cmd.exe /k "npm run dev"

:: Jalankan php artisan serve di jendela CMD utama
php artisan serve


