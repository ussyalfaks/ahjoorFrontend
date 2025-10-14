export const ROSCA_ABI = [
  {
    "name": "AhjoorROSCAImpl",
    "type": "impl",
    "interface_name": "ahjoor_::interfaces::iahjoor_rosca::IAhjoorROSCA"
  },
  {
    "name": "core::byte_array::ByteArray",
    "type": "struct",
    "members": [
      {
        "name": "data",
        "type": "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        "name": "pending_word",
        "type": "core::felt252"
      },
      {
        "name": "pending_word_len",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "name": "core::integer::u256",
    "type": "struct",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "name": "core::bool",
    "type": "enum",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "name": "ahjoor_::structs::group_info::GroupInfo",
    "type": "struct",
    "members": [
      {
        "name": "name",
        "type": "core::byte_array::ByteArray"
      },
      {
        "name": "description",
        "type": "core::byte_array::ByteArray"
      },
      {
        "name": "organizer",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "num_participants",
        "type": "core::integer::u32"
      },
      {
        "name": "contribution_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "round_duration",
        "type": "core::integer::u64"
      },
      {
        "name": "num_participants_stored",
        "type": "core::integer::u32"
      },
      {
        "name": "current_round",
        "type": "core::integer::u32"
      },
      {
        "name": "is_completed",
        "type": "core::bool"
      },
      {
        "name": "created_at",
        "type": "core::integer::u64"
      },
      {
        "name": "last_payout_time",
        "type": "core::integer::u64"
      },
      {
        "name": "token_address",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "name": "ahjoor_::interfaces::iahjoor_rosca::IAhjoorROSCA",
    "type": "interface",
    "items": [
      {
        "name": "create_group",
        "type": "function",
        "inputs": [
          {
            "name": "name",
            "type": "core::byte_array::ByteArray"
          },
          {
            "name": "description",
            "type": "core::byte_array::ByteArray"
          },
          {
            "name": "num_participants",
            "type": "core::integer::u32"
          },
          {
            "name": "contribution_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "round_duration",
            "type": "core::integer::u64"
          },
          {
            "name": "participant_addresses",
            "type": "core::array::Array::<core::starknet::contract_address::ContractAddress>"
          },
          {
            "name": "token_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "name": "contribute",
        "type": "function",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "claim_payout",
        "type": "function",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_group_info",
        "type": "function",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "ahjoor_::structs::group_info::GroupInfo"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "is_participant",
        "type": "function",
        "inputs": [
          {
            "name": "group_id",
            "type": "core::integer::u256"
          },
          {
            "name": "address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "get_group_count",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "pause",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "unpause",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "transfer_ownership",
        "type": "function",
        "inputs": [
          {
            "name": "new_owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "renounce_ownership",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "upgrade",
        "type": "function",
        "inputs": [
          {
            "name": "new_class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "is_paused",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "owner",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "is_token_supported",
        "type": "function",
        "inputs": [
          {
            "name": "token_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "constructor",
    "type": "constructor",
    "inputs": [
      {
        "name": "strk_token_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "ahjoor_::events::ahjoor_events::GroupCreated",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "group_id",
        "type": "core::integer::u256"
      },
      {
        "kind": "data",
        "name": "organizer",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "name",
        "type": "core::byte_array::ByteArray"
      },
      {
        "kind": "data",
        "name": "num_participants",
        "type": "core::integer::u32"
      },
      {
        "kind": "data",
        "name": "contribution_amount",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "ahjoor_::events::ahjoor_events::ContributionMade",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "group_id",
        "type": "core::integer::u256"
      },
      {
        "kind": "key",
        "name": "participant",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "amount",
        "type": "core::integer::u256"
      },
      {
        "kind": "data",
        "name": "round",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "ahjoor_::events::ahjoor_events::PayoutClaimed",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "group_id",
        "type": "core::integer::u256"
      },
      {
        "kind": "key",
        "name": "recipient",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "data",
        "name": "amount",
        "type": "core::integer::u256"
      },
      {
        "kind": "data",
        "name": "round",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "ahjoor_::events::ahjoor_events::Paused",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "account",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "ahjoor_::events::ahjoor_events::Unpaused",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "account",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "ahjoor_::events::ahjoor_events::OwnershipTransferred",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "previous_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "kind": "key",
        "name": "new_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "ahjoor_::events::ahjoor_events::Upgraded",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "new_class_hash",
        "type": "core::starknet::class_hash::ClassHash"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "ahjoor_::contracts::ahjoor_rosca::AhjoorROSCA::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "GroupCreated",
        "type": "ahjoor_::events::ahjoor_events::GroupCreated"
      },
      {
        "kind": "nested",
        "name": "ContributionMade",
        "type": "ahjoor_::events::ahjoor_events::ContributionMade"
      },
      {
        "kind": "nested",
        "name": "PayoutClaimed",
        "type": "ahjoor_::events::ahjoor_events::PayoutClaimed"
      },
      {
        "kind": "nested",
        "name": "Paused",
        "type": "ahjoor_::events::ahjoor_events::Paused"
      },
      {
        "kind": "nested",
        "name": "Unpaused",
        "type": "ahjoor_::events::ahjoor_events::Unpaused"
      },
      {
        "kind": "nested",
        "name": "OwnershipTransferred",
        "type": "ahjoor_::events::ahjoor_events::OwnershipTransferred"
      },
      {
        "kind": "nested",
        "name": "Upgraded",
        "type": "ahjoor_::events::ahjoor_events::Upgraded"
      }
    ]
  }
]as const;
