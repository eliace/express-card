


class Patient < ActiveRecord::Base
	
end


class AnalysisGroup < ActiveRecord::Base
	
end


class Analysis < ActiveRecord::Base
	belongs_to :analysis_group
end


class DrugUnit < ActiveRecord::Base
	
end

class DrugSolvent < ActiveRecord::Base
	
end

class DrugCategory < ActiveRecord::Base
	
end

class DrugGroup < ActiveRecord::Base
	belongs_to :drug_category
end

class Drug < ActiveRecord::Base
	belongs_to :drug_group
	belongs_to :drug_unit
	belongs_to :drug_solvent
end

