FROM php:8.2-apache

RUN mkdir /var/www/html/uploads 

# Installe PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql


# Active les modules Apache nécessaires
RUN a2enmod rewrite headers

# Augmente les tailles autorisées pour l'upload
RUN echo "upload_max_filesize=20M\npost_max_size=20M" > /usr/local/etc/php/conf.d/uploads.ini

# Copie les fichiers de l'application
COPY ./ /var/www/html


# Crée un dossier upload avec les bonnes permissions
RUN  chown -R www-data:www-data /var/www/html/uploads && \
    chmod -R 755 /var/www/html/uploads


# Autorise l'utilisation de .htaccess
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf