source "https://rubygems.org"

gem "jekyll", "~> 4.0.0"

# Minimal plugins to avoid architecture issues
group :jekyll_plugins do
  gem "jekyll-seo-tag", "~> 2.8"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Use `libldns` gem for JRuby builds since newer versions of `unbound` gem do not have a
# Java counterpart.
gem "libldns", :platforms => [:jruby]

# Use `json` gem for JRuby builds since newer versions of `json` gem do not have a
# Java counterpart.
gem "json", :platforms => [:jruby]
