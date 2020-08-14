defmodule Taskity.Repo do
  use Ecto.Repo,
    otp_app: :taskity,
    adapter: Ecto.Adapters.Postgres
end
