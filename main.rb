require 'rubygems'                                                                                                                            
require 'sinatra'                                                                                                                             
require 'haml'                                                                                                                                
require 'active_record'                                                                                                                       
require 'json'
require 'digest/sha2'


require 'records'
require 'ajax/login'
require 'ajax/users'
require 'ajax/patients'
require 'ajax/analyses'
require 'ajax/drugs'
require 'ajax/express_card'



set :haml, {:format => :html5, :attr_wrapper => '"'}                                                                                          
                                                                                                                                              
enable :sessions



configure do
	
  ActiveRecord::Base.configurations = YAML.load( File.open('db.yml') )
  ActiveRecord::Base.establish_connection(ENV['CONNECTION'] ? ENV['CONNECTION'] : 'development')
  
  # отключаем добавление корневого элемента при JSON-сериализации
  ActiveRecord::Base.include_root_in_json = false
	
end



class Hash	
	def filter(key_a)
		result = {}
		each_pair do |k, v|
	  	result[k.to_sym] = v if key_a.include? k
		end
		result
	end
end



helpers do
	
	def authenticate!
		return if request.path_info == '/login' 
		
		if request.path_info == '/logout' then
			session.delete :user
		end
		
		if not session.has_key? :user then
			request.path_info = '/login'
		end
			
	end
	
	
end



before do
	authenticate!
end


get '/' do
	@user = session[:user]
  haml :index
end
