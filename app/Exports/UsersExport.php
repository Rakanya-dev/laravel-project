<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping; // We'll use this to format data

class UsersExport implements FromCollection, WithHeadings, WithMapping
{
    protected $userType;

    /**
    * @param string $userType ('teacher' or 'parent')
    */
    public function __construct(string $userType)
    {
        $this->userType = $userType;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Fetch the users based on the type, including their daycare name
        return User::where('account_type', $this->userType)
            ->with('daycare:id,name')
            ->get();
    }

    /**
    * @return array
    */
    public function headings(): array
    {
        // These are the column headers for your file
        return [
            'ID',
            'First Name',
            'Middle Name',
            'Last Name',
            'Email',
            'Contact Number',
            'Daycare',
            'Status',
        ];
    }

    /**
    * @param mixed $user
    *
    * @return array
    */
    public function map($user): array
    {
        // This formats each row of data
        return [
            $user->id,
            $user->first_name,
            $user->middle_name,
            $user->last_name,
            $user->email,
            $user->contact_number,
            $user->daycare ? $user->daycare->name : 'N/A', // Safely get daycare name
            ucfirst($user->status), // Capitalize the status
        ];
    }
}
