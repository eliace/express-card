require 'rubygems'                                                                                                                            
require 'sinatra'                                                                                                                             
require 'haml'                                                                                                                                
require 'active_record'                                                                                                                       
require 'json'


require 'records'
require 'ajax/patients'



set :haml, {:format => :html5, :attr_wrapper => '"'}                                                                                          
                                                                                                                                              
enable :sessions



configure do
	
  ActiveRecord::Base.configurations = YAML.load( File.open('db.yml') )
  ActiveRecord::Base.establish_connection(ENV['CONNECTION'] ? ENV['CONNECTION'] : 'development')
  
  # отключаем добавление корневого элемента при JSON-сериализации
  ActiveRecord::Base.include_root_in_json = false
	
end




get '/' do
  haml :index
end
