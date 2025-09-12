import { DeviceErrorType } from '../utils/errorHandling';

export const DEVICE_MESSAGES = {
  DEVICES_PAGE_TITLE: 'Device Management',
  DEVICES_PAGE_SUBTITLE: 'Manage your SIMONAIR 4.0 devices',
  
  ADD_DEVICE: 'Add Device',
  EDIT_DEVICE: 'Edit Device',
  DELETE_DEVICE: 'Delete Device',
  VIEW_DETAILS: 'View Details',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  
  ADD_DEVICE_TITLE: 'Add New Device',
  ADD_DEVICE_DESCRIPTION: 'Pair a new SIMONAIR 4.0 device to your account. Fill in the device details below to get started.',
  
  EDIT_DEVICE_TITLE: 'Edit Device',
  EDIT_DEVICE_DESCRIPTION: 'Update information and settings for device "{device_name}".',
  
  DEVICE_DETAILS_TITLE: 'Device Details',
  DEVICE_DETAILS_DESCRIPTION: 'Complete information and sensor data for your device.',
  
  DELETE_DEVICE_TITLE: 'Delete Device',
  DELETE_DEVICE_DESCRIPTION: 'Are you sure you want to delete this device?',
  DELETE_WARNING: 'This action cannot be undone. All historical data for the device will be permanently lost.',
  
  DEVICE_ID_LABEL: 'Device ID',
  DEVICE_ID_PLACEHOLDER: 'Enter unique device ID',
  DEVICE_ID_HELP: 'Unique ID printed on your device (6-20 characters)',
  DEVICE_ID_LOCKED: 'Device ID cannot be changed after creation',
  
  DEVICE_NAME_LABEL: 'Device Name',
  DEVICE_NAME_PLACEHOLDER: 'Example: Living Room Aquarium',
  DEVICE_NAME_HELP: 'Easy-to-remember name for this device (3-50 characters)',
  
  LOCATION_LABEL: 'Location',
  LOCATION_PLACEHOLDER: 'Example: Living Room, Bedroom',
  LOCATION_HELP: 'Aquarium placement location for easy identification',
  
  AQUARIUM_SIZE_LABEL: 'Aquarium Size',
  AQUARIUM_SIZE_HELP: 'Aquarium dimensions in centimeters',
  LENGTH_LABEL: 'Length (cm)',
  WIDTH_LABEL: 'Width (cm)',
  HEIGHT_LABEL: 'Height (cm)',
  DIMENSIONS: 'Dimensions',
  VOLUME: 'Volume',
  
  GLASS_TYPE_LABEL: 'Glass Type',
  GLASS_TYPE_PLACEHOLDER: 'Select glass type',
  GLASS_TYPE_HELP: 'Aquarium glass type affects sensor readings',
  
  FISH_COUNT_LABEL: 'Fish Count',
  FISH_COUNT_PLACEHOLDER: '0',
  FISH_COUNT_HELP: 'Estimated number of fish in the aquarium',
  
  GLASS_TYPES: {
    CLEAR: 'Clear Glass',
    TINTED: 'Tinted Glass',
    TEMPERED: 'Tempered Glass',
    ACRYLIC: 'Acrylic',
  },
  
  STATUS_ONLINE: 'Online',
  STATUS_OFFLINE: 'Offline',
  STATUS_CONNECTING: 'Connecting...',
  STATUS_ERROR: 'Error',
  
  LAST_SEEN: 'Last Seen',
  NEVER_CONNECTED: 'Never Connected',
  CONNECTED_NOW: 'Connected Now',
  
  SEARCH_PLACEHOLDER: 'Search devices...',
  SEARCH_HELP: 'Search by device name, ID, or location',
  NO_DEVICES_FOUND: 'No devices found',
  NO_DEVICES_MESSAGE: 'No devices registered yet. Add your first device!',
  
  SHOWING_RESULTS: 'Showing {{start}} - {{end}} of {{total}} devices',
  PAGE_OF: 'Page {{current}} of {{total}}',
  
  LOADING_DEVICES: 'Loading device list...',
  LOADING_DEVICE_DETAILS: 'Loading device details...',
  SAVING_DEVICE: 'Saving device...',
  DELETING_DEVICE: 'Deleting device...',
  CONNECTING_DEVICE: 'Connecting device...',
  
  DEVICE_ADDED_SUCCESS: 'Device added successfully and ready to use!',
  DEVICE_UPDATED_SUCCESS: 'Device updated successfully!',
  DEVICE_DELETED_SUCCESS: 'Device deleted from the system!',
  
  TEMPERATURE: 'Temperature',
  PH_LEVEL: 'pH Level',
  DISSOLVED_OXYGEN: 'Dissolved Oxygen',
  TDS: 'Total Dissolved Solids',
  TURBIDITY: 'Turbidity',
  
  SENSOR_UNITS: {
    TEMPERATURE: '°C',
    PH: 'pH',
    DISSOLVED_OXYGEN: 'mg/L',
    TDS: 'ppm',
    TURBIDITY: 'NTU',
  },
  
  DEVICE_INFO: 'Device Information',
  SENSOR_DATA: 'Sensor Data',
  CONNECTION_HISTORY: 'Connection History',
  DEVICE_SETTINGS: 'Device Settings',
  
  UNSAVED_CHANGES_TITLE: 'Unsaved Changes',
  UNSAVED_CHANGES_DESCRIPTION: 'You have unsaved changes. Are you sure you want to close without saving? Your changes will be lost.',
  CONTINUE_EDITING: 'Continue Editing',
  DISCARD_CHANGES: 'Discard Changes',
  
  VALIDATION: {
    REQUIRED: 'This field is required',
    DEVICE_ID_REQUIRED: 'Device ID is required',
    DEVICE_ID_FORMAT: 'Device ID must be a combination of letters and numbers (no spaces)',
    DEVICE_ID_LENGTH: 'Device ID must be 6-20 characters',
    DEVICE_NAME_REQUIRED: 'Device name is required',
    DEVICE_NAME_LENGTH: 'Device name must be 3-50 characters',
    LOCATION_REQUIRED: 'Location is required',
    AQUARIUM_SIZE_REQUIRED: 'Aquarium size is required',
    AQUARIUM_SIZE_MIN: 'Minimum size is 10 cm for each dimension',
    AQUARIUM_SIZE_MAX: 'Maximum size is 500 cm for each dimension',
    FISH_COUNT_MIN: 'Fish count cannot be negative',
    FISH_COUNT_MAX: 'Maximum fish count is 1000',
  },
  
  ERRORS: {
    CREATE_DEVICE: {
      NETWORK_ERROR: 'Unable to add device due to network issues. Check your internet connection.',
      VALIDATION_ERROR: 'Please review the device information you entered.',
      CONFLICT_ERROR: 'Device ID is already registered. Use a different device ID.',
      AUTHORIZATION_ERROR: 'You do not have permission to add devices.',
      SERVER_ERROR: 'Unable to add device due to server issues. Try again later.',
      TIMEOUT_ERROR: 'Timeout while adding device. Try again.',
      NOT_FOUND_ERROR: 'Service not found.',
      UNKNOWN_ERROR: 'An unknown error occurred while adding the device.',
      DEFAULT: 'Failed to add device. Please try again.',
    },
    
    UPDATE_DEVICE: {
      NETWORK_ERROR: 'Unable to update device due to network issues. Check your internet connection.',
      VALIDATION_ERROR: 'Please review the device information you entered.',
      NOT_FOUND_ERROR: 'Device not found. It may have been deleted.',
      AUTHORIZATION_ERROR: 'You do not have permission to update this device.',
      SERVER_ERROR: 'Unable to update device due to server issues. Try again later.',
      TIMEOUT_ERROR: 'Timeout while updating device. Try again.',
      CONFLICT_ERROR: 'Data conflict while updating device.',
      UNKNOWN_ERROR: 'An unknown error occurred while updating the device.',
      DEFAULT: 'Failed to update device. Please try again.',
    },
    
    DELETE_DEVICE: {
      NETWORK_ERROR: 'Unable to delete device due to network issues. Check your internet connection.',
      NOT_FOUND_ERROR: 'Device not found. It may have been deleted.',
      AUTHORIZATION_ERROR: 'You do not have permission to delete this device.',
      SERVER_ERROR: 'Unable to delete device due to server issues. Try again later.',
      TIMEOUT_ERROR: 'Timeout while deleting device. Try again.',
      VALIDATION_ERROR: 'Invalid data for deletion.',
      CONFLICT_ERROR: 'Cannot delete device as it is still in use.',
      UNKNOWN_ERROR: 'An unknown error occurred while deleting the device.',
      DEFAULT: 'Failed to delete device. Please try again.',
    },
    
    FETCH_DEVICES: {
      NETWORK_ERROR: 'Unable to load devices due to network issues. Check your internet connection.',
      AUTHORIZATION_ERROR: 'You do not have permission to view devices. Please log in again.',
      SERVER_ERROR: 'Unable to load devices due to server issues. Try again later.',
      TIMEOUT_ERROR: 'Timeout while loading devices. Try again.',
      VALIDATION_ERROR: 'Invalid search parameters.',
      NOT_FOUND_ERROR: 'No devices found.',
      CONFLICT_ERROR: 'Conflict while fetching device data.',
      UNKNOWN_ERROR: 'An unknown error occurred while loading devices.',
      DEFAULT: 'Failed to load devices. Please try again.',
    },
    
    FETCH_DEVICE: {
      NETWORK_ERROR: 'Unable to load device details due to network issues. Check your internet connection.',
      NOT_FOUND_ERROR: 'Device not found. It may have been deleted or you do not have access.',
      AUTHORIZATION_ERROR: 'You do not have permission to view this device.',
      SERVER_ERROR: 'Unable to load device details due to server issues. Try again later.',
      TIMEOUT_ERROR: 'Timeout while loading device details. Try again.',
      VALIDATION_ERROR: 'Invalid device ID.',
      CONFLICT_ERROR: 'Conflict while fetching device details.',
      UNKNOWN_ERROR: 'An unknown error occurred while loading device details.',
      DEFAULT: 'Failed to load device details. Please try again.',
    },
  },
  
  ERROR_TITLES: {
    [DeviceErrorType.NETWORK_ERROR]: 'Connection Issue',
    [DeviceErrorType.TIMEOUT_ERROR]: 'Timeout',
    [DeviceErrorType.AUTHORIZATION_ERROR]: 'Access Denied',
    [DeviceErrorType.VALIDATION_ERROR]: 'Invalid Data',
    [DeviceErrorType.CONFLICT_ERROR]: 'Data Conflict',
    [DeviceErrorType.NOT_FOUND_ERROR]: 'Not Found',
    [DeviceErrorType.SERVER_ERROR]: 'Server Error',
    [DeviceErrorType.UNKNOWN_ERROR]: 'An Error Occurred',
  },
  
  TRY_AGAIN: 'Try Again',
  CHECK_CONNECTION: 'Check Connection',
  RELOAD_PAGE: 'Reload Page',
  DISMISS: 'Close',
  CONTACT_SUPPORT: 'Contact Support',
  
  EMPTY_STATE_TITLE: 'No Devices Yet',
  EMPTY_STATE_DESCRIPTION: 'Start monitoring your aquarium by adding your first device.',
  EMPTY_SEARCH_TITLE: 'No Results',
  EMPTY_SEARCH_DESCRIPTION: 'No devices match your search.',
  
  A11Y: {
    DEVICE_CARD: 'Device card {{name}}',
    DEVICE_STATUS: 'Device status: {{status}}',
    DEVICE_ACTIONS: 'Device actions',
    SEARCH_INPUT: 'Search devices',
    PAGINATION_BUTTON: 'Page {{page}}',
    CLOSE_MODAL: 'Close modal',
    LOADING: 'Loading',
    ERROR: 'Error message',
  },
} as const;

export function getLocalizedErrorMessage(
  operation: keyof typeof DEVICE_MESSAGES.ERRORS,
  errorType: DeviceErrorType
): string {
  const operationErrors = DEVICE_MESSAGES.ERRORS[operation];
  const errorKey = errorType as keyof typeof operationErrors;
  return operationErrors[errorKey] || operationErrors.DEFAULT;
}

export function getLocalizedErrorTitle(errorType: DeviceErrorType): string {
  return DEVICE_MESSAGES.ERROR_TITLES[errorType] || DEVICE_MESSAGES.ERROR_TITLES[DeviceErrorType.UNKNOWN_ERROR];
}
