# Boram Apps

Tổng hợp các chương trình nhỏ trong repo [`boram123`](https://github.com/jihyeeee63-spec/boram123).

## Cấu trúc thư mục

```
boram123/
├── index.html              ← Trang tổng hợp (hub)
├── Mo Hub.bat              ← Mở hub nhanh trên Windows
├── daily-checklist/        ← Checklist hàng ngày
├── weather-map/            ← SkyMap thời tiết
└── expense-tracker/        ← Nhật ký thu · chi
```

## Các ứng dụng

| Thư mục | Tên | Mô tả |
|---------|-----|--------|
| `daily-checklist/` | Checklist hàng ngày | Việc cần làm trong ngày, hỗ trợ Việt · Hàn |
| `weather-map/` | SkyMap | Bản đồ dự báo thời tiết |
| `expense-tracker/` | Nhật ký chi tiêu | Thu · chi theo ngày, biểu đồ màu + % , VI · EN |

## Cách mở

### Trang tổng hợp
- Double-click `index.html` hoặc `Mo Hub.bat`
- Link local: `file:///C:/Users/sinhvien/Projects/daily-checklist/index.html`

### Từng ứng dụng
| App | Mở nhanh |
|-----|----------|
| Checklist | `daily-checklist/Mo Checklist.bat` hoặc `Checklist.url` |
| SkyMap | `weather-map/Mo SkyMap.bat` (chạy server local) |
| Chi tiêu | `expense-tracker/Mo Chi Tieu.bat` hoặc `Chi Tieu.url` |

### SkyMap (cần server)
```bat
weather-map\Mo SkyMap.bat
```
Sau đó mở: http://localhost:5500/weather-map/

## GitHub

https://github.com/jihyeeee63-spec/boram123
