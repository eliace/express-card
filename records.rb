


class Patient < ActiveRecord::Base
	
end


class AnalysisGroup < ActiveRecord::Base
	
end


class Analysis < ActiveRecord::Base
	belongs_to :analysis_group
end