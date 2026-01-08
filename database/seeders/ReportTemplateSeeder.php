<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear existing templates
        DB::table('report_templates')->truncate();

        // 2. Define the Assessment-Focused templates
        $templates = [
            [
                'name' => 'Monthly Progress Report',
                'description' => 'Short-term assessment summary for individual children',
                'type' => 'Monthly',
                'is_active' => true,
                'content' => json_encode([
                    'frequency' => 'Monthly',
                    'settings' => [
                        'pageSize' => 'A4',
                        'orientation' => 'portrait',
                        'includeHeader' => true,
                        'includeFooter' => true,
                        'includeLogo' => true,
                        'includeSignature' => true,
                        'colorScheme' => 'default'
                    ],
                    'sections' => [
                        [
                            'id' => 'section-1',
                            'title' => 'Child Information',
                            'description' => 'Basic details',
                            'fields' => [
                                ['id' => 'f1', 'type' => 'text', 'label' => 'Child Name', 'placeholder' => 'Enter full name', 'required' => true],
                                ['id' => 'f2', 'type' => 'date', 'label' => 'Report Date', 'required' => true],
                                ['id' => 'f3', 'type' => 'text', 'label' => 'Age', 'placeholder' => 'e.g., 4 years', 'required' => true],
                                ['id' => 'f4', 'type' => 'text', 'label' => 'Teacher Name', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-2',
                            'title' => 'Developmental Domains',
                            'description' => 'Snapshot of key areas',
                            'fields' => [
                                ['id' => 'f6', 'type' => 'number', 'label' => 'Cognitive Development Score', 'placeholder' => '0-100', 'required' => true],
                                ['id' => 'f7', 'type' => 'textarea', 'label' => 'Cognitive Observations', 'required' => false],
                                ['id' => 'f8', 'type' => 'number', 'label' => 'Physical Development Score', 'placeholder' => '0-100', 'required' => true],
                                ['id' => 'f9', 'type' => 'textarea', 'label' => 'Physical Observations', 'required' => false],
                                ['id' => 'f10', 'type' => 'number', 'label' => 'Social-Emotional Score', 'placeholder' => '0-100', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-3',
                            'title' => 'Summary',
                            'fields' => [
                                ['id' => 'f12', 'type' => 'chart', 'label' => 'Monthly Trend Chart', 'required' => false],
                                ['id' => 'f13', 'type' => 'textarea', 'label' => 'Key Strengths', 'required' => true],
                                ['id' => 'f14', 'type' => 'textarea', 'label' => 'Focus Areas', 'required' => true],
                            ]
                        ]
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Quarterly Developmental Assessment',
                'description' => 'Detailed evaluation across all developmental domains',
                'type' => 'Quarterly',
                'is_active' => true,
                'content' => json_encode([
                    'frequency' => 'Quarterly',
                    'settings' => [
                        'pageSize' => 'Letter',
                        'orientation' => 'portrait',
                        'includeHeader' => true,
                        'includeFooter' => true,
                        'includeLogo' => true,
                        'includeSignature' => true,
                        'colorScheme' => 'green'
                    ],
                    'sections' => [
                        [
                            'id' => 'section-1',
                            'title' => 'Assessment Context',
                            'fields' => [
                                ['id' => 'f1', 'type' => 'text', 'label' => 'Child Name', 'required' => true],
                                ['id' => 'f2', 'type' => 'date', 'label' => 'Report Date', 'required' => true],
                                ['id' => 'f3', 'type' => 'select', 'label' => 'Quarter', 'options' => ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'], 'required' => true],
                                ['id' => 'f4', 'type' => 'text', 'label' => 'Age', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-2',
                            'title' => 'Cognitive Development',
                            'fields' => [
                                ['id' => 'f6', 'type' => 'number', 'label' => 'Cognitive Score', 'placeholder' => '0-100', 'required' => true],
                                ['id' => 'f7', 'type' => 'checkbox', 'label' => 'Problem-Solving Skills', 'required' => false],
                                ['id' => 'f8', 'type' => 'checkbox', 'label' => 'Memory & Recall', 'required' => false],
                                ['id' => 'f9', 'type' => 'textarea', 'label' => 'Detailed Observations', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-3',
                            'title' => 'Motor Skills',
                            'fields' => [
                                ['id' => 'f11', 'type' => 'number', 'label' => 'Fine Motor Score', 'placeholder' => '0-100', 'required' => true],
                                ['id' => 'f12', 'type' => 'number', 'label' => 'Gross Motor Score', 'placeholder' => '0-100', 'required' => true],
                                ['id' => 'f14', 'type' => 'chart', 'label' => 'Motor Skills Chart', 'required' => false],
                            ]
                        ],
                        [
                            'id' => 'section-4',
                            'title' => 'Language & Communication',
                            'fields' => [
                                ['id' => 'f15', 'type' => 'number', 'label' => 'Language Score', 'placeholder' => '0-100', 'required' => true],
                                ['id' => 'f16', 'type' => 'checkbox', 'label' => 'Expressive Language', 'required' => false],
                                ['id' => 'f17', 'type' => 'checkbox', 'label' => 'Receptive Language', 'required' => false],
                            ]
                        ],
                        [
                            'id' => 'section-5',
                            'title' => 'Action Plan',
                            'fields' => [
                                ['id' => 'f19', 'type' => 'textarea', 'label' => 'Goals for Next Quarter', 'required' => true],
                                ['id' => 'f20', 'type' => 'textarea', 'label' => 'Recommended Activities', 'required' => true],
                            ]
                        ]
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Annual Summary Report',
                'description' => 'Year-end comprehensive developmental summary',
                'type' => 'Annual',
                'is_active' => true,
                'content' => json_encode([
                    'frequency' => 'Annually',
                    'settings' => [
                        'pageSize' => 'Letter',
                        'orientation' => 'landscape',
                        'includeHeader' => true,
                        'includeFooter' => true,
                        'includeLogo' => true,
                        'includeSignature' => true,
                        'colorScheme' => 'purple'
                    ],
                    'sections' => [
                        [
                            'id' => 'section-1',
                            'title' => 'Student Overview',
                            'fields' => [
                                ['id' => 'f1', 'type' => 'text', 'label' => 'Child Name', 'required' => true],
                                ['id' => 'f2', 'type' => 'date', 'label' => 'Report Date', 'required' => true],
                                ['id' => 'f3', 'type' => 'text', 'label' => 'Current Age', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-2',
                            'title' => 'Year-Long Progress',
                            'fields' => [
                                ['id' => 'f6', 'type' => 'chart', 'label' => 'Annual Progress Chart', 'required' => true],
                                ['id' => 'f7', 'type' => 'table', 'label' => 'Domain Scores Comparison', 'required' => true],
                                ['id' => 'f8', 'type' => 'textarea', 'label' => 'Major Achievements', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-3',
                            'title' => 'Behavioral Summary',
                            'fields' => [
                                ['id' => 'f10', 'type' => 'textarea', 'label' => 'Social Interaction & Emotional Regulation', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-4',
                            'title' => 'Future Recommendations',
                            'fields' => [
                                ['id' => 'f13', 'type' => 'textarea', 'label' => 'Development Goals', 'required' => true],
                                ['id' => 'f15', 'type' => 'checkbox', 'label' => 'Ready for Next Level', 'required' => false],
                            ]
                        ]
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Parent-Teacher Conference Form',
                'description' => 'Structured form for parent-teacher meetings',
                'type' => 'Communication',
                'is_active' => true,
                'content' => json_encode([
                    'frequency' => 'Quarterly',
                    'settings' => [
                        'pageSize' => 'Letter',
                        'orientation' => 'portrait',
                        'includeHeader' => true,
                        'includeFooter' => true,
                        'includeLogo' => true,
                        'includeSignature' => true,
                        'colorScheme' => 'default'
                    ],
                    'sections' => [
                        [
                            'id' => 'section-1',
                            'title' => 'Meeting Information',
                            'fields' => [
                                ['id' => 'f1', 'type' => 'text', 'label' => 'Child Name', 'required' => true],
                                ['id' => 'f2', 'type' => 'date', 'label' => 'Meeting Date', 'required' => true],
                                ['id' => 'f4', 'type' => 'text', 'label' => 'Parent/Guardian Names', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-2',
                            'title' => 'Discussion Topics',
                            'fields' => [
                                ['id' => 'f5', 'type' => 'textarea', 'label' => 'Academic Progress', 'required' => true],
                                ['id' => 'f6', 'type' => 'textarea', 'label' => 'Social Development', 'required' => true],
                            ]
                        ],
                        [
                            'id' => 'section-3',
                            'title' => 'Parent Input',
                            'fields' => [
                                ['id' => 'f8', 'type' => 'textarea', 'label' => 'Parent Questions/Concerns', 'required' => false],
                            ]
                        ],
                        [
                            'id' => 'section-4',
                            'title' => 'Action Items',
                            'fields' => [
                                ['id' => 'f10', 'type' => 'textarea', 'label' => 'Shared Goals', 'required' => true],
                            ]
                        ]
                    ]
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('report_templates')->insert($templates);
    }
}
