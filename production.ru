require 'rubygems'
require 'sinatra'

set :env, :production
set :port, 4567
disable :run, :reload

require 'server.rb'

run Sinatra::Application