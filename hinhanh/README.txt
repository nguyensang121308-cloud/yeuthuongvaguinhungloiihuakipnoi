BƯU THIẾP & THÁP THƯ — CẤU TRÚC THƯ MỤC
=======================================

buuthiep/
├── index.html        trang chính (mở file này bằng Dreamweaver hoặc trình duyệt)
├── css/
│   └── style.css     toàn bộ giao diện, màu xanh dương, bố cục laptop + điện thoại
├── js/
│   └── main.js       toàn bộ chữ, thư, chủ đề và hiệu ứng
└── images/           ẢNH — thay ảnh mẫu bằng ảnh của bạn (giữ nguyên tên file)
    ├── bia.jpg           ảnh bưu thiếp bìa
    ├── loai1.jpg … loai6.jpg   ảnh bưu thiếp của 6 chủ đề
    └── thu1.jpg … thu13.jpg    ảnh kèm từng bức thư

CÁCH SỬA NHANH (mở js/main.js, bấm Ctrl+F rồi gõ tên cần tìm)
-------------------------------------------------------------
  const LOAI      -> thêm / sửa / xóa chủ đề (Lời cảm ơn, Lời xin lỗi...)
  const thu       -> nội dung từng bức thư (tieude, ngay, anh, noidung, ky...)
  const CHU       -> chữ cố định trên trang (tiêu đề, nút, banner...)
                     và các HASHTAG trang trí (hashtag, hashtag_troi)
  const CHU_KY    -> chữ ký cuối thư
  const HIEU_UNG  -> tỉ lệ và loại hiệu ứng bất ngờ khi mở thư

MÀU XANH: mở css/style.css, tìm  :root  ở đầu file, sửa --nhan, --nhan-dam, --nen.

LƯU Ý
-----
- Ảnh nên tỉ lệ ngang 3:2 (ví dụ 1800 x 1200), mỗi ảnh dưới ~500 KB cho nhẹ điện thoại.
- Giữ đúng tên file ảnh (đúng chữ hoa/thường, đúng đuôi .jpg), hoặc sửa đường dẫn trong js/main.js.
- Khi đưa lên mạng, tải CẢ thư mục lên (index.html, css, js, images).
- Dreamweaver: lưu file ở dạng UTF-8 để tiếng Việt không bị lỗi.
- Phông chữ lấy từ Google Fonts nên máy cần có mạng lần đầu mở trang.
