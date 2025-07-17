import { DeviceErrorType } from '../utils/errorHandling';

/**
 * Indonesian language constants for device management
 */
export const DEVICE_MESSAGES = {
  // Page titles and headers
  DEVICES_PAGE_TITLE: 'Manajemen Perangkat',
  DEVICES_PAGE_SUBTITLE: 'Kelola perangkat monitoring akuarium Anda',
  
  // Device actions
  ADD_DEVICE: 'Tambah Perangkat',
  EDIT_DEVICE: 'Edit Perangkat',
  DELETE_DEVICE: 'Hapus Perangkat',
  VIEW_DETAILS: 'Lihat Detail',
  SAVE_CHANGES: 'Simpan Perubahan',
  CANCEL: 'Batal',
  CONFIRM: 'Konfirmasi',
  
  // Modal titles and descriptions
  ADD_DEVICE_TITLE: 'Tambah Perangkat Baru',
  ADD_DEVICE_DESCRIPTION: 'Pasangkan perangkat monitoring akuarium baru ke akun Anda. Isi detail perangkat di bawah ini untuk memulai.',
  
  EDIT_DEVICE_TITLE: 'Edit Perangkat',
  EDIT_DEVICE_DESCRIPTION: 'Perbarui informasi dan pengaturan perangkat "{device_name}".',
  
  DEVICE_DETAILS_TITLE: 'Detail Perangkat',
  DEVICE_DETAILS_DESCRIPTION: 'Informasi lengkap dan data sensor perangkat Anda.',
  
  DELETE_DEVICE_TITLE: 'Hapus Perangkat',
  DELETE_DEVICE_DESCRIPTION: 'Apakah Anda yakin ingin menghapus perangkat ini?',
  DELETE_WARNING: 'Tindakan ini tidak dapat dibatalkan. Semua data historis perangkat akan hilang permanen.',
  
  // Form labels
  DEVICE_ID_LABEL: 'ID Perangkat',
  DEVICE_ID_PLACEHOLDER: 'Masukkan ID perangkat unik',
  DEVICE_ID_HELP: 'ID unik yang tertera pada perangkat Anda (6-20 karakter)',
  DEVICE_ID_LOCKED: 'ID perangkat tidak dapat diubah setelah pembuatan',
  
  DEVICE_NAME_LABEL: 'Nama Perangkat',
  DEVICE_NAME_PLACEHOLDER: 'Contoh: Akuarium Ruang Tamu',
  DEVICE_NAME_HELP: 'Nama yang mudah diingat untuk perangkat ini (3-50 karakter)',
  
  LOCATION_LABEL: 'Lokasi',
  LOCATION_PLACEHOLDER: 'Contoh: Ruang Tamu, Kamar Tidur',
  LOCATION_HELP: 'Lokasi penempatan akuarium untuk memudahkan identifikasi',
  
  AQUARIUM_SIZE_LABEL: 'Ukuran Akuarium',
  AQUARIUM_SIZE_HELP: 'Dimensi akuarium dalam sentimeter',
  LENGTH_LABEL: 'Panjang (cm)',
  WIDTH_LABEL: 'Lebar (cm)',
  HEIGHT_LABEL: 'Tinggi (cm)',
  DIMENSIONS: 'Dimensi',
  VOLUME: 'Volume',
  
  GLASS_TYPE_LABEL: 'Jenis Kaca',
  GLASS_TYPE_PLACEHOLDER: 'Pilih jenis kaca',
  GLASS_TYPE_HELP: 'Jenis kaca akuarium mempengaruhi pembacaan sensor',
  
  FISH_COUNT_LABEL: 'Jumlah Ikan',
  FISH_COUNT_PLACEHOLDER: '0',
  FISH_COUNT_HELP: 'Perkiraan jumlah ikan dalam akuarium',
  
  // Glass type options
  GLASS_TYPES: {
    CLEAR: 'Kaca Bening',
    TINTED: 'Kaca Berwarna',
    TEMPERED: 'Kaca Tempered',
    ACRYLIC: 'Akrilik',
  },
  
  // Device status
  STATUS_ONLINE: 'Online',
  STATUS_OFFLINE: 'Offline',
  STATUS_CONNECTING: 'Menghubungkan...',
  STATUS_ERROR: 'Error',
  
  LAST_SEEN: 'Terakhir Terlihat',
  NEVER_CONNECTED: 'Belum Pernah Terhubung',
  CONNECTED_NOW: 'Terhubung Sekarang',
  
  // Search and pagination
  SEARCH_PLACEHOLDER: 'Cari perangkat...',
  SEARCH_HELP: 'Cari berdasarkan nama, ID, atau lokasi perangkat',
  NO_DEVICES_FOUND: 'Tidak ada perangkat ditemukan',
  NO_DEVICES_MESSAGE: 'Belum ada perangkat yang terdaftar. Tambahkan perangkat pertama Anda!',
  
  SHOWING_RESULTS: 'Menampilkan {{start}} - {{end}} dari {{total}} perangkat',
  PAGE_OF: 'Halaman {{current}} dari {{total}}',
  
  // Loading states
  LOADING_DEVICES: 'Memuat daftar perangkat...',
  LOADING_DEVICE_DETAILS: 'Memuat detail perangkat...',
  SAVING_DEVICE: 'Menyimpan perangkat...',
  DELETING_DEVICE: 'Menghapus perangkat...',
  CONNECTING_DEVICE: 'Menghubungkan perangkat...',
  
  // Success messages
  DEVICE_ADDED_SUCCESS: 'Perangkat berhasil ditambahkan dan siap digunakan!',
  DEVICE_UPDATED_SUCCESS: 'Perangkat berhasil diperbarui!',
  DEVICE_DELETED_SUCCESS: 'Perangkat berhasil dihapus dari sistem!',

  // Sensor data labels
  TEMPERATURE: 'Suhu',
  PH_LEVEL: 'Tingkat pH',
  DISSOLVED_OXYGEN: 'Oksigen Terlarut',
  TDS: 'Total Dissolved Solids',
  TURBIDITY: 'Kekeruhan',
  
  SENSOR_UNITS: {
    TEMPERATURE: '°C',
    PH: 'pH',
    DISSOLVED_OXYGEN: 'mg/L',
    TDS: 'ppm',
    TURBIDITY: 'NTU',
  },
  
  // Device info
  DEVICE_INFO: 'Informasi Perangkat',
  SENSOR_DATA: 'Data Sensor',
  CONNECTION_HISTORY: 'Riwayat Koneksi',
  DEVICE_SETTINGS: 'Pengaturan Perangkat',
  
  // Unsaved changes
  UNSAVED_CHANGES_TITLE: 'Perubahan Belum Disimpan',
  UNSAVED_CHANGES_DESCRIPTION: 'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup tanpa menyimpan? Perubahan Anda akan hilang.',
  CONTINUE_EDITING: 'Lanjutkan Mengedit',
  DISCARD_CHANGES: 'Buang Perubahan',
  
  // Validation messages
  VALIDATION: {
    REQUIRED: 'Field ini wajib diisi',
    DEVICE_ID_REQUIRED: 'ID perangkat wajib diisi',
    DEVICE_ID_FORMAT: 'ID perangkat harus berupa kombinasi huruf dan angka (tanpa spasi)',
    DEVICE_ID_LENGTH: 'ID perangkat harus 6-20 karakter',
    DEVICE_NAME_REQUIRED: 'Nama perangkat wajib diisi',
    DEVICE_NAME_LENGTH: 'Nama perangkat harus 3-50 karakter',
    LOCATION_REQUIRED: 'Lokasi wajib diisi',
    AQUARIUM_SIZE_REQUIRED: 'Ukuran akuarium wajib diisi',
    AQUARIUM_SIZE_MIN: 'Ukuran minimal 10 cm untuk setiap dimensi',
    AQUARIUM_SIZE_MAX: 'Ukuran maksimal 500 cm untuk setiap dimensi',
    FISH_COUNT_MIN: 'Jumlah ikan tidak boleh negatif',
    FISH_COUNT_MAX: 'Jumlah ikan maksimal 1000 ekor',
  },
  
  // Error messages by operation
  ERRORS: {
    CREATE_DEVICE: {
      NETWORK_ERROR: 'Tidak dapat menambahkan perangkat karena masalah jaringan. Periksa koneksi internet Anda.',
      VALIDATION_ERROR: 'Periksa kembali informasi perangkat yang Anda masukkan.',
      CONFLICT_ERROR: 'ID perangkat sudah terdaftar. Gunakan ID perangkat yang berbeda.',
      AUTHORIZATION_ERROR: 'Anda tidak memiliki izin untuk menambahkan perangkat.',
      SERVER_ERROR: 'Tidak dapat menambahkan perangkat karena masalah server. Coba lagi nanti.',
      TIMEOUT_ERROR: 'Waktu habis saat menambahkan perangkat. Coba lagi.',
      NOT_FOUND_ERROR: 'Layanan tidak ditemukan.',
      UNKNOWN_ERROR: 'Terjadi kesalahan tidak dikenal saat menambahkan perangkat.',
      DEFAULT: 'Gagal menambahkan perangkat. Silakan coba lagi.',
    },
    
    UPDATE_DEVICE: {
      NETWORK_ERROR: 'Tidak dapat memperbarui perangkat karena masalah jaringan. Periksa koneksi internet Anda.',
      VALIDATION_ERROR: 'Periksa kembali informasi perangkat yang Anda masukkan.',
      NOT_FOUND_ERROR: 'Perangkat tidak ditemukan. Mungkin sudah dihapus.',
      AUTHORIZATION_ERROR: 'Anda tidak memiliki izin untuk memperbarui perangkat ini.',
      SERVER_ERROR: 'Tidak dapat memperbarui perangkat karena masalah server. Coba lagi nanti.',
      TIMEOUT_ERROR: 'Waktu habis saat memperbarui perangkat. Coba lagi.',
      CONFLICT_ERROR: 'Konflik data saat memperbarui perangkat.',
      UNKNOWN_ERROR: 'Terjadi kesalahan tidak dikenal saat memperbarui perangkat.',
      DEFAULT: 'Gagal memperbarui perangkat. Silakan coba lagi.',
    },
    
    DELETE_DEVICE: {
      NETWORK_ERROR: 'Tidak dapat menghapus perangkat karena masalah jaringan. Periksa koneksi internet Anda.',
      NOT_FOUND_ERROR: 'Perangkat tidak ditemukan. Mungkin sudah dihapus.',
      AUTHORIZATION_ERROR: 'Anda tidak memiliki izin untuk menghapus perangkat ini.',
      SERVER_ERROR: 'Tidak dapat menghapus perangkat karena masalah server. Coba lagi nanti.',
      TIMEOUT_ERROR: 'Waktu habis saat menghapus perangkat. Coba lagi.',
      VALIDATION_ERROR: 'Data tidak valid untuk penghapusan.',
      CONFLICT_ERROR: 'Tidak dapat menghapus perangkat karena masih digunakan.',
      UNKNOWN_ERROR: 'Terjadi kesalahan tidak dikenal saat menghapus perangkat.',
      DEFAULT: 'Gagal menghapus perangkat. Silakan coba lagi.',
    },
    
    FETCH_DEVICES: {
      NETWORK_ERROR: 'Tidak dapat memuat perangkat karena masalah jaringan. Periksa koneksi internet Anda.',
      AUTHORIZATION_ERROR: 'Anda tidak memiliki izin untuk melihat perangkat. Silakan login kembali.',
      SERVER_ERROR: 'Tidak dapat memuat perangkat karena masalah server. Coba lagi nanti.',
      TIMEOUT_ERROR: 'Waktu habis saat memuat perangkat. Coba lagi.',
      VALIDATION_ERROR: 'Parameter pencarian tidak valid.',
      NOT_FOUND_ERROR: 'Tidak ada perangkat ditemukan.',
      CONFLICT_ERROR: 'Konflik saat mengambil data perangkat.',
      UNKNOWN_ERROR: 'Terjadi kesalahan tidak dikenal saat memuat perangkat.',
      DEFAULT: 'Gagal memuat perangkat. Silakan coba lagi.',
    },
    
    FETCH_DEVICE: {
      NETWORK_ERROR: 'Tidak dapat memuat detail perangkat karena masalah jaringan. Periksa koneksi internet Anda.',
      NOT_FOUND_ERROR: 'Perangkat tidak ditemukan. Mungkin sudah dihapus atau Anda tidak memiliki akses.',
      AUTHORIZATION_ERROR: 'Anda tidak memiliki izin untuk melihat perangkat ini.',
      SERVER_ERROR: 'Tidak dapat memuat detail perangkat karena masalah server. Coba lagi nanti.',
      TIMEOUT_ERROR: 'Waktu habis saat memuat detail perangkat. Coba lagi.',
      VALIDATION_ERROR: 'ID perangkat tidak valid.',
      CONFLICT_ERROR: 'Konflik saat mengambil detail perangkat.',
      UNKNOWN_ERROR: 'Terjadi kesalahan tidak dikenal saat memuat detail perangkat.',
      DEFAULT: 'Gagal memuat detail perangkat. Silakan coba lagi.',
    },
  },
  
  // Error titles
  ERROR_TITLES: {
    [DeviceErrorType.NETWORK_ERROR]: 'Masalah Koneksi',
    [DeviceErrorType.TIMEOUT_ERROR]: 'Waktu Habis',
    [DeviceErrorType.AUTHORIZATION_ERROR]: 'Akses Ditolak',
    [DeviceErrorType.VALIDATION_ERROR]: 'Data Tidak Valid',
    [DeviceErrorType.CONFLICT_ERROR]: 'Konflik Data',
    [DeviceErrorType.NOT_FOUND_ERROR]: 'Tidak Ditemukan',
    [DeviceErrorType.SERVER_ERROR]: 'Error Server',
    [DeviceErrorType.UNKNOWN_ERROR]: 'Terjadi Kesalahan',
  },
  
  // Action buttons
  TRY_AGAIN: 'Coba Lagi',
  CHECK_CONNECTION: 'Periksa Koneksi',
  RELOAD_PAGE: 'Muat Ulang Halaman',
  DISMISS: 'Tutup',
  CONTACT_SUPPORT: 'Hubungi Dukungan',
  
  // Empty states
  EMPTY_STATE_TITLE: 'Belum Ada Perangkat',
  EMPTY_STATE_DESCRIPTION: 'Mulai monitoring akuarium Anda dengan menambahkan perangkat pertama.',
  EMPTY_SEARCH_TITLE: 'Tidak Ada Hasil',
  EMPTY_SEARCH_DESCRIPTION: 'Tidak ditemukan perangkat yang sesuai dengan pencarian Anda.',
  
  // Accessibility labels
  A11Y: {
    DEVICE_CARD: 'Kartu perangkat {{name}}',
    DEVICE_STATUS: 'Status perangkat: {{status}}',
    DEVICE_ACTIONS: 'Aksi perangkat',
    SEARCH_INPUT: 'Cari perangkat',
    PAGINATION_BUTTON: 'Halaman {{page}}',
    CLOSE_MODAL: 'Tutup modal',
    LOADING: 'Sedang memuat',
    ERROR: 'Pesan error',
  },
} as const;

/**
 * Get localized error message for specific operation
 */
export function getLocalizedErrorMessage(
  operation: keyof typeof DEVICE_MESSAGES.ERRORS,
  errorType: DeviceErrorType
): string {
  const operationErrors = DEVICE_MESSAGES.ERRORS[operation];
  const errorKey = errorType as keyof typeof operationErrors;
  return operationErrors[errorKey] || operationErrors.DEFAULT;
}

/**
 * Get localized error title
 */
export function getLocalizedErrorTitle(errorType: DeviceErrorType): string {
  return DEVICE_MESSAGES.ERROR_TITLES[errorType] || DEVICE_MESSAGES.ERROR_TITLES[DeviceErrorType.UNKNOWN_ERROR];
}