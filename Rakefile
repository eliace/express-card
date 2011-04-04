require 'rubygems'
require 'active_record'
require 'logger'


task :start do
#  Dir.chdir 'config'
  %x[thin -C config.yml -R production.ru start]
end

task :stop do
#  Dir.chdir 'config'
  %x[thin -C config.yml stop]
end

task :devel do
  %x[ruby main.rb]
end



namespace :db do
  
	ActiveRecord::Base.configurations = YAML.load( File.open('db.yml') )
  ActiveRecord::Base.establish_connection(ENV['CONNECTION'] ? ENV['CONNECTION'] : 'development')
    
  ActiveRecord::Base.logger = Logger.new(STDERR)
  
  task :migrate do        
    ActiveRecord::Migrator.migrate('db/migrations', ENV["VERSION"] ? ENV["VERSION"].to_i : nil )
  end
  
  task :rollback do        
    ActiveRecord::Migrator.rollback('db/migrations', ENV["STEP"] ? ENV["STEP"].to_i : 1 )
  end

end
