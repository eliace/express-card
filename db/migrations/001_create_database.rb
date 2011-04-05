require 'foreigner'

class CreateDatabase < ActiveRecord::Migration
  
  class User < ActiveRecord::Base
  end
  class Patient < ActiveRecord::Base
  end
  class AnalysisGroup < ActiveRecord::Base
  end
  
  def self.up
    
    # Пользователи
    create_table :users do |t|
      t.string :first_name
      t.string :middle_name
      t.string :last_name
      t.string :login
      t.string :password
    end   
    
    # Пациенты
    create_table :patients do |t|
      t.string :name                            		# имя пациента
      t.integer :patient_no                    		# номер пациента
      t.text :diagnosis                        		# диагноз
      t.string :sex                             		# пол (male|female)
      t.date :birth_date                       		# дата рождения
      t.date :admission_date              				# дата поступления
      t.float :birth_weight												# вес при рождении
      t.float :admission_weight										# вес при поступлении
      t.float :weight															# текущий вес
      t.boolean :dismissed, :default => false		# выписан (aka удален)
    end
    
		# Учитываемые эффекты препаратов
		create_table :drug_effects do |t|
      t.float :proteins
      t.float :fats
      t.float :carbohydrates
      t.float :calories
		end

		# Растворители
		create_table :drug_solvents do |t|
			t.string :name
			t.references :drug_effect
		end

    add_foreign_key(:drug_solvents, :drug_effects)

    # Группы препаратов
    create_table :drug_groups do |t|
      t.string :name
      t.integer :parent_id
    end

    # Категории препаратов (препараты, питание и др.)
    create_table :drug_categories do |t|
      t.string :name
    end

    # Единицы измерения препаратов
    create_table :drug_units do |t|
      t.string :name
    end

		# Препараты (препараты, питание)
    create_table :drugs do |t|
      t.string :name																# наименование
      t.references :drug_category									# категория
      t.references :drug_group											# группа
			t.references :drug_effect										# эффект (калорийность, электролиты и др.)
			t.references :drug_unit											# единицы измерения 
      t.references :drug_solvent										# раствор
			t.float :content															# содержание в растворе	
		end
  
    add_foreign_key(:drugs, :drug_categories)
    add_foreign_key(:drugs, :drug_groups)
    add_foreign_key(:drugs, :drug_solvents)
    add_foreign_key(:drugs, :drug_effects)
    add_foreign_key(:drugs, :drug_units)
  

		# группы анализов
    create_table :analysis_groups do |t|
      t.string :name
      t.integer :parent_id
    end

		# анализы
    create_table :analyses do |t|
      t.string :name
      t.references :analysis_group
    end

    add_foreign_key(:analyses, :analysis_groups)

=begin

		# группы питания
    create_table :nutrition_groups do |t|
      t.string :name
      t.integer :parent_id
#      t.references :appointment
#      t.boolean :deleted, :default => false
    end
    
#    add_foreign_key(:nutrition_groups, :appointments)

		# питание
    create_table :nutritions do |t|
      t.string :name
      t.references :nutrition_group
#      t.references :appointment
      t.float :proteins
      t.float :fats
      t.float :carbohydrates
      t.float :calories
#      t.boolean :deleted, :default => false
    end

    add_foreign_key(:nutritions, :nutrition_groups)
#    add_foreign_key(:nutritions, :appointments)


		# группы препаратов
    create_table :drug_groups do |t|
      t.string :name
      t.integer :parent_id
#      t.references :appointment
      t.boolean :deleted, :default => false
    end
    
#    add_foreign_key(:drug_groups, :appointments)

		# препараты
    create_table :drugs do |t|
      t.string :name
      t.references :drug_group
      t.references :appointment
      t.boolean :deleted, :default => false
    end

    add_foreign_key(:drugs, :drug_groups)
    add_foreign_key(:drugs, :appointments)


#    create_table :scheduled_analyses do |t|
#      t.references :patient
#      t.references :analysis
#      t.date :from_date
#      t.integer :regularity
#    end
#
#    add_foreign_key(:scheduled_analyses, :patients)
#    add_foreign_key(:scheduled_analyses, :analyses)

=end


		#
		# Заполняем базу данных тестовыми данными
		#
		
		Patient.create(:name => 'Вася', :patient_no => 1, :diagnosis => 'Воспаление межушного ганглия');
		
		AnalysisGroup.create(:name => 'Клинические');
		AnalysisGroup.create(:name => 'Биохимические');
		AnalysisGroup.create(:name => 'Бактериологические');
		

    
  end
  
  def self.down

    drop_table :drugs
    drop_table :drug_groups
    drop_table :drug_units
    drop_table :drug_categories
    drop_table :drug_solvents
    drop_table :drug_effects
    drop_table :analyses
    drop_table :analysis_groups
    
#    drop_table :appointments

    drop_table :users
    drop_table :patients
    
  end
  
  
end
