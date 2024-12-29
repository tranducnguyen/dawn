module.exports = {
  apps: [
    {
      name: 'dawn',
      script: 'dawn.service.js',
      instances: '1',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/access.log',
      merge_logs: true,
      logrotate: {
        maxFiles: 7,
        compress: true,
        dateext: true,
        max_size: '10M',
        retain: '37',
        dateFormat: 'YYYY-MM-DD_HH-mm-ss',
        workerInterval: '30',
        rotateInterval: '0 0 * * *',
        rotateModule: true,
        postrotate: 'gzip -f logs/access.log.*',
      }
      // Other environment variables if needed
    },
  ],
};